import crypto from "node:crypto";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { AppError } from "../utils/appError.js";

export const payUPIService = async ({ user, orderId }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== user._id.toString())
        throw new AppError("Not authorised to access this order", 403);

    const txnId = crypto.randomUUID();
    const amount = process.env.NODE_ENV === "development" ? 1 : order.totalAmount;

    const upiUrl =
        `upi://pay?` +
        `pa=${process.env.UPI_ID}` +
        `&pn=${encodeURIComponent(process.env.UPI_NAME || "VendorHub")}` +
        `&tr=${txnId}` +
        `&tn=${encodeURIComponent(`Order-${order._id}`)}` +
        `&am=${1}` +
        `&cu=INR`;

    return { orderId: order._id, txnId, amount, upiUrl };
};

export const submitUPITransactionService = async ({ user, orderId, utr }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== user._id.toString())
        throw new AppError("Not authorised", 403);

    if (!utr || utr.trim().length < 8)
        throw new AppError("Invalid transaction ID", 400);

    const existingUTR = await Payment.findOne({ utr });

    if (existingUTR)
        throw new AppError("Transaction ID already used", 400);

    let payment = await Payment.findOne({ order: order._id });

    if (payment) {
        if (payment.status === "paid" || payment.status === "pending_verification")
            throw new AppError("Order already paid", 400);

        await payment.deleteOne();
    }

    payment = await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        method: "upi",
        status: "pending_verification",
        transactionId: utr.toString(),
        transactionType: "order",
        user: order.buyer,
    });

    return payment;
};

export const approveUPIPaymentService = async ({ admin, paymentId }) => {
    const payment = await Payment.findById(paymentId).populate("order");

    if (!payment)
        throw new AppError("Payment not found", 404);

    payment.status = "paid";
    await payment.save();

    if (payment.order) {
        payment.order.orderStatus = "confirmed";
        await payment.order.save();
    }

    return payment;
};