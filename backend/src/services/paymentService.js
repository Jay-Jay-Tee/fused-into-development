import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Refund } from "../models/Refund.js";
import { AppError } from "../utils/appError.js";

let razorpay = null;
const getRazorpay = () => {
    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
};

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
    process.env.CASHFREE_ENV === "production"
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

// ------- private helpers: creating order ----------------

const _createRazorpayOrder = async (order) => {
    const razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(order.totalAmount * 100), // convert rupees → paise
        currency: "INR",
        receipt: `order_${order._id}`,
    });

    return {
        paymentType: "razorpay",
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
    };
};

const _createCashfreeOrder = async (order) => {
    const cfOrderId = `cf_${order._id}`;

    const { data } = await Cashfree.PGCreateOrder("2023-08-01", {
        order_id: cfOrderId,
        order_amount: (order.totalAmount / 100).toFixed(2), // Cashfree expects rupees, not paise
        order_currency: "INR",
        customer_details: {
            customer_id: order.buyer.toString(),
            customer_email: order.buyerEmail || "customer@example.com",
            customer_phone: order.buyerPhone || "9999999999",
        },
    });

    return {
        paymentType: "cashfree",
        cashfreeOrderId: data.order_id,
        paymentSessionId: data.payment_session_id,
        amount: order.totalAmount,
        currency: "INR",
        orderId: order._id,
    };
};

// ----- private helpers: verifying orders --------------

const _verifyRazorpayPayment = async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId,
}) => {
    const order = await Order.findById(orderId).populate("payment");

    if (!order) throw new AppError("Order not found", 404);
    if (order.buyer.toString() !== userId)
        throw new AppError("Unauthorised attempt at verification", 401);
    if (order.orderStatus === "confirmed") return { message: "Already verified" };

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        throw new AppError("Invalid payment signature", 401);

    return { order, transactionId: razorpayPaymentId, method: "razorpay" };
};

const _verifyCashfreePayment = async ({ orderId, cashfreeOrderId, userId }) => {
    const order = await Order.findById(orderId).populate("payment");

    if (!order) throw new AppError("Order not found", 404);
    if (order.buyer.toString() !== userId)
        throw new AppError("Unauthorised attempt at verification", 401);
    if (order.orderStatus === "confirmed") return { message: "Already verified" };

    const cfOrderId = cashfreeOrderId || `cf_${orderId}`;

    const { data } = await Cashfree.PGOrderFetchPayments("2023-08-01", cfOrderId);

    const captured = Array.isArray(data)
        ? data.find((p) => p.payment_status === "SUCCESS")
        : null;

    if (!captured) throw new AppError("Payment not yet captured by Cashfree", 402);

    return { order, transactionId: captured.cf_payment_id.toString(), method: "cashfree" };
};

// -------- Prive Helpers: Handling webhook ---------------

const _handleRazorpayWebhook = async ({
    eventType,
    paymentId,
    orderId,
    razorpaySignature,
    webhookBody,
}) => {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(webhookBody)
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        throw new AppError("Invalid webhook signature", 401);

    if (eventType !== "payment.captured")
        return { message: "Event type not processed" };

    return { orderId, paymentId, method: "razorpay" };
};

const _handleCashfreeWebhook = async ({ webhookBody, cashfreeSignature, timestamp }) => {
    // Cashfree signs: timestamp + rawBody
    const rawBody =
        typeof webhookBody === "string"
            ? webhookBody
            : webhookBody.toString("utf8");

    const signaturePayload = timestamp + rawBody;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
        .update(signaturePayload)
        .digest("base64");

    if (expectedSignature !== cashfreeSignature)
        throw new AppError("Invalid Cashfree webhook signature", 401);

    const parsed = typeof webhookBody === "string" ? JSON.parse(webhookBody) : JSON.parse(rawBody);
    const { type, data } = parsed;

    if (type !== "PAYMENT_SUCCESS_WEBHOOK")
        return { message: "Event type not processed" };

    // Cashfree order_id is "cf_<mongoOrderId>"
    const cfOrderId = data?.order?.order_id || "";
    const orderId = cfOrderId.startsWith("cf_") ? cfOrderId.slice(3) : cfOrderId;
    const paymentId = data?.payment?.cf_payment_id?.toString();

    return { orderId, paymentId, method: "cashfree" };
};

const _confirmOrder = async ({ orderId, transactionId, method }) => {
    const order = await Order.findById(orderId)

    if (!order) throw new AppError("Order not found for this payment", 404);

    if (order.orderStatus === "confirmed") return { message: "Order already confirmed" };

    let payment = await Payment.findOne({ transactionId });

    if (!payment) {
        payment = await Payment.create({
            user: order.buyer,
            order: order._id,
            amount: order.totalAmount,
            method,
            transactionType: "order",
            transactionId,
            status: "paid",
        });
    }

    const updated = await Order.findOneAndUpdate(
        { _id: orderId, orderStatus: "pending" },
        { $set: { orderStatus: "confirmed", payment: payment._id } },
        { new: true }
    );

    if (!updated) {
        return { message: "Already processed" };
    }

    await Product.bulkWrite(
        updated.items.map(item => ({
            updateOne: {
                filter: { _id: item.product, stock: { $gte: item.quantity } },
                update: { $inc: { stock: -item.quantity } },
            },
        }))
    );

    return { success: true, payment };
};

// ----- exported services ----------------------

export const createPaymentOrderService = async ({ orderId, userId, paymentType = "razorpay" }) => {
    const order = await Order.findById(orderId).populate("payment");

    if (!order) throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== userId)
        throw new AppError("Not authorized for this order", 403);

    if (order.payment?.status === "paid")
        throw new AppError("Order already paid", 409);

    if (paymentType === "cashfree") return _createCashfreeOrder(order);
    return _createRazorpayOrder(order);
};


// verifies the signature/status, writes a payment document,
// updates the order status to confirmed.
export const verifyPaymentService = async ({
    orderId,
    paymentType = "razorpay",
    // razorpay fields
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    // cashfree fields
    cashfreeOrderId,
    userId,
}) => {
    let result;

    if (paymentType === "cashfree") {
        result = await _verifyCashfreePayment({ orderId, cashfreeOrderId, userId });
    } else {
        result = await _verifyRazorpayPayment({
            orderId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            userId,
        });
    }

    // Early return for idempotency messages
    if (result.message) return result;

    return _confirmOrder({
        orderId,
        transactionId: result.transactionId,
        method: result.method,
    });
};


// Called by admin after approving a refund request.
// Initiates a Razorpay refund against the original payment's transactionId
// and writes a new Payment document with transactionType: refund.
export const triggerRefundService = async ({ refundId }) => {
    const refund = await Refund.findById(refundId).populate({
        path: "order",
        populate: { path: "payment" },
    });

    if (!refund) throw new AppError("Refund request not found", 404);
    if (refund.status !== "approved")
        throw new AppError("Refund must be approved before triggering payment", 400);

    const originalPayment = refund.order.payment;

    if (originalPayment?.status !== "paid")
        throw new AppError("Original payment not found or not paid", 400);

    const razorpayRefund = await getRazorpay().payments.refund(
        originalPayment.transactionId,
        { amount: refund.refundAmount }
    );

    const payment = await Payment.create({
        user: refund.buyer,
        refund: refund._id,
        amount: refund.refundAmount,
        method: "razorpay",
        transactionType: "refund",
        transactionId: razorpayRefund.id,
        status: "paid",
    });

    // mark refund as resolved and record when it was settled.
    refund.status = "resolved";
    refund.resolvedAt = new Date();
    await refund.save();

    return { success: true, payment };
};

export const getPaymentsByOrderService = async ({ orderId }) => {
    const directPayments = await Payment.find({ order: orderId }).lean();

    // Find refunds for this order first, then find their payments
    const refundDocs = await Refund.find({ order: orderId }).select("_id").lean();
    const refundIds = refundDocs.map(r => r._id);
    const refundPayments = refundIds.length > 0
        ? await Payment.find({ transactionType: "refund", refund: { $in: refundIds } }).lean()
        : [];

    return [...directPayments, ...refundPayments];
};

export const getMyPaymentsService = async ({ userId }) => {
    return await Payment.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("order", "orderStatus totalAmount")
        .populate("refund", "reason refundAmount")
        .lean();
};

export const handleWebhookService = async ({
    paymentType = "razorpay",
    eventType,
    paymentId,
    orderId,
    amount,
    // razorpay
    razorpaySignature,
    webhookBody,
    // cashfree
    cashfreeSignature,
    timestamp,
}) => {
    let resolved;

    if (paymentType === "cashfree") {
        resolved = await _handleCashfreeWebhook({ webhookBody, cashfreeSignature, timestamp });
    } else {
        resolved = await _handleRazorpayWebhook({
            eventType,
            paymentId,
            orderId,
            razorpaySignature,
            webhookBody,
        });
    }

    if (resolved.message) return resolved;

    return _confirmOrder({
        orderId: resolved.orderId,
        transactionId: resolved.paymentId,
        method: resolved.method,
    });
};

export const payUPIService = async ({ user, orderId }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError('Order not found', 404);

    if (order.buyer.toString() !== user._id.toString())
        throw new AppError('Not authorised to access this order', 403);

    const txnId = crypto.randomUUID();

    const amount =
        process.env.NODE_ENV === 'development'
            ? 1
            : order.totalAmount;

    const upiUrl =
        `upi://pay?` +
        `pa=${process.env.UPI_ID}` +
        `&pn=${encodeURIComponent(process.env.UPI_NAME || 'VendorHub')}` +
        `&tr=${txnId}` +
        `&tn=${encodeURIComponent(`Order-${order._id}`)}` +
        `&am=${1}` +
        `&cu=INR`;

    return {
        orderId: order._id,
        txnId,
        amount,
        upiUrl,
    };
};

export const submitUPITransactionService = async ({
    user,
    orderId,
    utr,
}) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError('Order not found', 404);

    if (order.buyer.toString() !== user._id.toString())
        throw new AppError('Not authorised', 403);

    if (!utr || utr.trim().length < 8)
        throw new AppError('Invalid transaction ID', 400);

    const existingUTR = await Payment.findOne({ utr });

    if (existingUTR)
        throw new AppError('Transaction ID already used', 400);

    let payment = await Payment.findOne({ order: order._id });

    if (payment) {
        if (payment.status === 'paid' || payment.status === "pending_verification")
            throw new AppError('Order already paid', 400);

        await payment.deleteOne();
    }

    payment = await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        method: 'upi',
        status: 'pending_verification',
        transactionId: utr.toString()
    });

    return payment;
};

export const approveUPIPaymentService = async ({
    admin,
    paymentId,
}) => {
    const payment = await Payment.findById(paymentId)
        .populate('order');

    if (!payment)
        throw new AppError('Payment not found', 404);

    payment.status = 'paid';

    await payment.save();

    if (payment.order) {
        payment.order.orderStatus = 'confirmed';
        await payment.order.save();
    }

    return payment;
};