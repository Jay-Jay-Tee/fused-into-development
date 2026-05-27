import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { AppError } from "./appError.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";

const CASHFREE_API_VERSION = "2023-08-01";

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

// a very small function that returns order ID
const buildCashfreeOrderId = (orderId) => `cf_${orderId}`;

export const createGatewaySession = async ({ order, paymentType = "razorpay" }) => {
    if (paymentType === "cashfree") {
        const cashfreeOrderId = buildCashfreeOrderId(order._id);
        const { data } = await Cashfree.PGCreateOrder(CASHFREE_API_VERSION, {
            order_id: cashfreeOrderId,
            order_amount: Number((order.totalAmount / 100).toFixed(2)),
            order_currency: "INR",
            customer_details: {
                customer_id: order.buyer.toString(),
                customer_email: order.buyerEmail || "customer@example.com",
                customer_phone: order.buyerPhone || "9999999999",
            },
        });

        return {
            paymentType: "cashfree",
            paymentSessionId: data.payment_session_id,
            amount: order.totalAmount,
            currency: "INR",
            orderId: order._id,
        };
    }

    const razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(order.totalAmount),
        currency: "INR",
        receipt: `order_${order._id}`,
    });

    return {
        paymentType: "razorpay",
        gatewayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
    };
};

export const verifyRazorpayPaymentSignature = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        throw new AppError("Invalid payment signature", 401);
};

export const fetchCashfreeSuccessfulPayment = async ({ cashfreeOrderId }) => {
    const { data } = await Cashfree.PGOrderFetchPayments(
        CASHFREE_API_VERSION,
        cashfreeOrderId
    );

    const captured = Array.isArray(data)
        ? data.find((payment) => payment.payment_status === "SUCCESS")
        : null;

    if (!captured)
        throw new AppError("Payment not yet captured by Cashfree", 402);

    return captured;
};

export const verifyRazorpayWebhookSignature = ({
    razorpaySignature,
    webhookBody,
}) => {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(webhookBody)
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        throw new AppError("Invalid webhook signature", 401);
};

export const resolveCashfreeWebhook = ({
    webhookBody,
    cashfreeSignature,
    timestamp,
}) => {
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

    const parsed = JSON.parse(rawBody);
    const { type, data } = parsed;
    const cashfreeOrderId = data?.order?.order_id || "";
    const orderId = cashfreeOrderId.startsWith("cf_")
        ? cashfreeOrderId.slice(3)
        : cashfreeOrderId;

    return {
        eventType: type,
        orderId,
        paymentId: data?.payment?.cf_payment_id?.toString(),
        cashfreeOrderId,
    };
};

export const createGatewayRefund = async ({ payment, refund, orderId }) => {
    if (payment.method === "cashfree") {
        const resolvedOrderId = orderId?._id || orderId || payment.order?._id || payment.order;

        if (!resolvedOrderId)
            throw new AppError("Original Cashfree order information is missing", 400);

        const refundId = refund.gatewayRefundId || `refund_${refund._id}`;
        const { data } = await Cashfree.PGOrderCreateRefund(
            CASHFREE_API_VERSION,
            buildCashfreeOrderId(resolvedOrderId),
            {
                refund_amount: Number((refund.refundAmount / 100).toFixed(2)),
                refund_id: refundId,
                refund_note: refund.reason,
            }
        );

        return {
            gatewayRefundId:
                data.cf_refund_id?.toString() ||
                data.refund_id ||
                refundId,
        };
    }

    const razorpayRefund = await getRazorpay().payments.refund(
        payment.transactionId,
        { amount: refund.refundAmount }
    );

    return { gatewayRefundId: razorpayRefund.id };
};

// -- Payment DB persistence --------------------------------------------------
// Kept here because these are the "write the gateway result" counterpart
// to the session/signature helpers above.

export const findPaymentByGatewayTransaction = async ({ method, transactionId }) => {
    if (!transactionId)
        return null;

    return Payment.findOne({ method, transactionId });
};

export const persistOrderPayment = async ({ order, method, status, transactionId }) => {
    const paymentData = {
        amount: order.totalAmount,
        method,
        order: order._id,
        status,
        transactionType: "order",
        user: order.buyer,
        transactionId,
    };

    const existingRef = order.payment;
    const isPopulated = existingRef?.constructor?.modelName === "Payment";
    let payment = isPopulated ?
        existingRef
        : existingRef ?
            await Payment.findById(existingRef)
            : null;

    if (!payment) {
        try {
            payment = await Payment.create(paymentData);
        } catch (error) {
            if (error.code !== 11000)
                throw error;

            payment = await findPaymentByGatewayTransaction({ method, transactionId });
        }

        if (!payment)
            throw new AppError("Payment could not be persisted", 500);

        await Order.updateOne({ _id: order._id }, { $set: { payment: payment._id } });
        return payment;
    }

    payment.amount = paymentData.amount;
    payment.method = paymentData.method;
    payment.status = paymentData.status;
    payment.transactionId = paymentData.transactionId;
    payment.gatewayOrderId = undefined;
    payment.paymentSessionId = undefined;
    await payment.save();
    return payment;
};

export { buildCashfreeOrderId };