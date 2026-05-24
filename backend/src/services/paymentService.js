import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Product } from "../models/Product.js";
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

    // Atomic update — only succeeds if order is still pending.
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
                filter: { _id: item.product },
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

    // initiate refund via Razorpay using original payment's transactionId
    // amount is in paise
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

    // mark refund as resolved and record when it was settled.
    refund.status = "resolved";
    refund.resolvedAt = new Date();
    await refund.save();

    return { success: true, payment };
};

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

    if (expectedSignature !== razorpaySignature) {
        const err = new Error("Invalid webhook signature");
        err.statusCode = 401;
        throw err;
    }

    if (eventType !== "payment.captured") {
        return { message: "Event type not processed" };
    }

    const order = await Order.findById(orderId);

    if (!order) {
        const err = new Error("Order not found for this payment");
        err.statusCode = 404;
        throw err;
    }

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
                filter: { _id: item.product },
                update: { $inc: { stock: -item.quantity } },
            },
        }))
    );

    return { success: true, payment };
};