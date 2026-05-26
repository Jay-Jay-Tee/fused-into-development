import crypto from "node:crypto";
import Razorpay from "razorpay";
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

export const createPaymentOrderService = async ({ orderId, userId }) => {
    const order = await Order.findById(orderId).populate("payment");

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // Only the buyer who placed the order can pay for it.
    if (order.buyer.toString() !== userId) {
        throw new AppError("Not authorized for this order", 403);
    }

    // If a Payment document exists and is already paid, reject.
    if (order.payment?.status === "paid") {
        throw new AppError("Order already paid", 409);
    }

    const razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(order.totalAmount),  // input is recieved in paise
        currency: "INR",
        receipt: `order_${order._id}`,
    });

    return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
    };
};


// Verifies the HMAC signature, writes a Payment document,
// updates the Order status to confirmed.
export const verifyPaymentService = async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId,
}) => {
    const order = await Order.findById(orderId).populate("payment");

    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== userId)
        throw new AppError("Unauthorised attempt at verification", 401);

    if (order.orderStatus === "confirmed") {
        return { message: "Already verified" };
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        throw new AppError("Invalid payment signature", 401);
    }

    const payment = await Payment.create({
        user: userId,
        order: orderId,
        amount: order.totalAmount,
        method: "razorpay",
        transactionType: "order",
        transactionId: razorpayPaymentId,
        status: "paid",
    });

    // only succeeds if order is still pending.
    // Prevents double-processing if webhook fires at the same time.
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


// Called by admin after approving a refund request.
// Initiates a Razorpay refund against the original payment's transactionId
// and writes a new Payment document with transactionType: refund.
export const triggerRefundService = async ({ refundId }) => {
    const refund = await Refund.findById(refundId).populate({
        path: "order",
        populate: { path: "payment" },
    });

    if (!refund) {
        throw new AppError("Refund request not found", 404);
    }

    if (refund.status !== "approved") {
        throw new AppError("Refund must be approved before triggering payment", 400);
    }

    const originalPayment = refund.order.payment;

    if (originalPayment?.status !== "paid") {
        throw new AppError("Original payment not found or not paid", 400);
    }

    // initiate refund via Razorpay using original payment's transactionId
    // amount is in paise
    const razorpayRefund = await getRazorpay().payments.refund(
        originalPayment.transactionId,
        { amount: refund.refundAmount }
    );

    // Write a Payment document representing the money going back to the buyer.
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
    eventType,
    paymentId,
    orderId,
    amount,
    razorpaySignature,
    webhookBody,
}) => {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(webhookBody)
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        throw new AppError("Invalid webhook signature", 401);

    if (eventType !== "payment.captured") {
        return { message: "Event type not processed" };
    }

    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError("Order not found for this payment", 404);

    if (order.orderStatus === "confirmed") {
        return { message: "Order already confirmed" };
    }

    // Check if Payment document already exists, /verify may have created it first.
    let payment = await Payment.findOne({ transactionId: paymentId });

    if (!payment) {
        payment = await Payment.create({
            user: order.buyer,
            order: order._id,
            amount: order.totalAmount,
            method: "razorpay",
            transactionType: "order",
            transactionId: paymentId,
            status: "paid",
        });
    }

    // only update if order is still pending
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

export const payUPIService = async ({ user, orderId }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError('Order not found', 404);

    if (order.customer.toString() !== user._id.toString())
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

    if (order.customer.toString() !== user._id.toString())
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
        payment.status = "paid";
        await payment.order.save();
    }

    return payment;
};