import crypto from "crypto";
import Razorpay from "razorpay";

import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Refund } from "../models/Refund.js";

export const createPaymentOrderService = async ({ orderId, userId }) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }

    if (order.buyer.toString() !== userId) {
        const err = new Error("Not authorized for this order");
        err.statusCode = 403;
        throw err;
    }

    if (order.payment && order.payment.status === "paid") {
        const err = new Error("Order already paid");
        err.statusCode = 409;
        throw err;
    }

    if (order.payment && order.payment.status === "failed") {
        const err = new Error("Previous payment attempt failed, please create a new order");
        err.statusCode = 409;
        throw err;
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const razorpayOrder = await razorpay.orders.create({
        // remember razorpay amount is in paise, so expect input in paise
        currency: "INR",
        receipt: `order_${order._id}`
    });

    return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
    };
};

export const verifyPaymentService = async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId
}) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
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

    // idempotency check
    if (order.paymentStatus === "paid") {
        return { message: "Already verified" };
    }

    order.orderStatus = "confirmed";
    await order.save();

    const payment = await Payment.create({
        order: orderId,
        buyer: userId,
        amount: order.totalAmount,
        type: "purchase",
        razorpayPaymentId,
        razorpayOrderId
    });

    return { success: true, payment };
};