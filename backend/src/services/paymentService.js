import crypto from "node:crypto";
import Razorpay from "razorpay";

import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Refund } from "../models/Refund.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrderService = async ({ orderId, userId }) => {
    const order = await Order.findById(orderId).populate("payment");

    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }

    // Only the buyer who placed the order can pay for it.
    if (order.buyer.toString() !== userId) {
        const err = new Error("Not authorized for this order");
        err.statusCode = 403;
        throw err;
    }

    // If a Payment document exists and is already paid, reject.
    if (order.payment?.status === "paid") {
        const err = new Error("Order already paid");
        err.statusCode = 409;
        throw err;
    }

    const razorpayOrder = await razorpay.orders.create({
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

    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }

    if (order.orderStatus === "confirmed") {
        return { message: "Already verified" };
    }

    // HMAC signature verification.
    // Razorpay signs razorpayOrderId|razorpayPaymentId with the key secret.
    // We recompute and compare — if they don't match, the request is forged.
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        const err = new Error("Invalid payment signature");
        err.statusCode = 401;
        throw err;
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

    order.payment = payment._id;
    order.orderStatus = "confirmed";
    await order.save();

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
        const err = new Error("Refund request not found");
        err.statusCode = 404;
        throw err;
    }

    if (refund.status !== "approved") {
        const err = new Error("Refund must be approved before triggering payment");
        err.statusCode = 400;
        throw err;
    }

    const originalPayment = refund.order.payment;

    if (originalPayment?.status !== "paid") {
        const err = new Error("Original payment not found or not paid");
        err.statusCode = 400;
        throw err;
    }

    // Initiate refund via Razorpay against the original payment's transactionId.
    // Amount is in paise.
    const razorpayRefund = await razorpay.payments.refund(
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

    // Mark the refund as resolved and record when it was settled.
    refund.status = "resolved";
    refund.resolvedAt = new Date();
    await refund.save();

    return { success: true, payment };
};

// ── getPaymentsByOrderService ─────────────────────────────────
// Returns all Payment documents linked to a specific order.
// Includes both the original purchase and any refund payments.
export const getPaymentsByOrderService = async ({ orderId }) => {
    const directPayments = await Payment.find({ order: orderId }).lean();

    // Refund payments link to the order via refund → order, not directly.
    // We fetch all refund-type payments and filter by matching order.
    const refundPayments = await Payment.find({ transactionType: "refund" })
        .populate({ path: "refund", match: { order: orderId } })
        .lean();

    const filteredRefundPayments = refundPayments.filter(p => p.refund !== null);

    return [...directPayments, ...filteredRefundPayments];
};

// ── getMyPaymentsService ──────────────────────────────────────
// Returns all Payment documents for the logged-in buyer.
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
    // HMAC signature verification for webhook security.
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(webhookBody)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        const err = new Error("Invalid webhook signature");
        err.statusCode = 401;
        throw err;
    }

    // Only process payment.captured events.
    if (eventType !== "payment.captured") {
        return { message: "Event type not processed" };
    }

    // Find order by Razorpay payment ID.
    const order = await Order.findOne({ "payment.transactionId": paymentId });

    if (!order) {
        const err = new Error("Order not found for this payment");
        err.statusCode = 404;
        throw err;
    }

    // If already confirmed, skip (idempotent).
    if (order.orderStatus === "confirmed") {
        return { message: "Order already confirmed" };
    }

    // Create Payment document if one doesn't exist.
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

    // Update order status to confirmed.
    order.payment = payment._id;
    order.orderStatus = "confirmed";
    await order.save();

    return { success: true, payment };
};