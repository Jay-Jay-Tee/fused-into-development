import { Refund } from "../models/Refund.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { AppError } from "../utils/appError.js";
import { createGatewayRefund, findPaymentByGatewayTransaction } from "../utils/paymentGateway.js";
import { getExistingRefundPayment } from "../utils/paymentReservation.js";

export const createRefundService = async ({ userId, orderId, itemId, reason }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== userId)
        throw new AppError("Not authorised for this order", 403);

    if (order.orderStatus !== "delivered")
        throw new AppError("Refunds can only be raised for delivered orders", 403);

    // find the specific item within the order by matching product ID
    const item = order.items.find(i => i.product.toString() === itemId);

    if (!item)
        throw new AppError("Item not found in this order", 404);

    // check no existing pending/approved refund for this item in this order
    const existingRefund = await Refund.findOne({
        order: orderId,
        refundScope: "item",
        "item.product": itemId,
        status: { $in: ["pending", "approved"] },
    });

    if (existingRefund)
        throw new AppError("A refund request already exists for this item", 409);

    // refundAmount is price * quantity from the order snapshot, for now
    const refundAmount = item.price * item.quantity;

    const refund = await Refund.create({
        order: orderId,
        item,
        reason,
        refundScope: "item",
        source: "buyer",
        refundAmount,
        buyer: userId,
        status: "pending",
    });

    return refund.toObject();
};

export const getMyRefundsService = async ({ userId }) =>
    Refund.find({ buyer: userId })
        .populate("order", "orderStatus totalAmount")
        .sort({ createdAt: -1 })
        .lean();

export const getAllRefundsService = async ({ status }) => {
    const filter = {};
    if (status) filter.status = status;

    return Refund.find(filter)
        .populate("buyer", "name email")
        .populate("order", "orderStatus totalAmount")
        .sort({ createdAt: -1 })
        .lean();
};

export const getRefundByIdService = async ({ refundId }) => {
    const refund = await Refund.findById(refundId)
        .populate("buyer", "name email")
        .populate("order", "orderStatus totalAmount")
        .lean();

    if (!refund)
        throw new AppError("Refund request not found", 404);

    return refund;
};

export const approveRefundService = async ({ refundId, adminNote }) => {
    const refund = await Refund.findById(refundId);

    if (!refund)
        throw new AppError("Refund request not found", 404);

    if (refund.status !== "pending")
        throw new AppError(`Refund is already ${refund.status}`, 400);

    refund.status = "approved";
    if (adminNote) refund.adminNote = adminNote;
    await refund.save();

    return refund.toObject();
};

export const rejectRefundService = async ({ refundId, adminNote }) => {
    const refund = await Refund.findById(refundId);

    if (!refund) 
        throw new AppError("Refund request not found", 404);

    if (refund.status !== "pending")
        throw new AppError(`Refund is already ${refund.status}`, 400);

    refund.status = "rejected";
    if (adminNote) refund.adminNote = adminNote;
    await refund.save();

    return refund.toObject();
};

// Admin triggers the actual gateway refund after approving.
export const triggerRefundService = async ({ refundId }) => {
    let refund = await Refund.findOneAndUpdate(
        { _id: refundId, status: "approved" },
        { $set: { status: "processing" } },
        { new: true }
    ).populate({ path: "order", populate: { path: "payment" } });

    if (!refund) {
        refund = await Refund.findById(refundId)
            .populate({ path: "order", populate: { path: "payment" } });

        if (!refund)
            throw new AppError("Refund request not found", 404);

        if (refund.status === "resolved")
            return { success: true, payment: await getExistingRefundPayment(refund) };

        if (refund.status === "processing" && !refund.gatewayRefundId)
            return { message: "Refund is already processing" };

        if (refund.status !== "processing")
            throw new AppError("Refund must be approved before triggering payment", 400);
    }

    const originalPayment = refund.order.payment;

    if (originalPayment?.status !== "paid")
        throw new AppError("Original payment not found or not paid", 400);

    if (!refund.gatewayRefundId) {
        const { gatewayRefundId } = await createGatewayRefund({
            payment: originalPayment,
            refund,
            orderId: refund.order,
        });
        refund.gatewayRefundId = gatewayRefundId;
        await refund.save();
    }

    let payment = await getExistingRefundPayment(refund);

    if (!payment) {
        try {
            payment = await Payment.create({
                amount: refund.refundAmount,
                method: originalPayment.method,
                refund: refund._id,
                status: "paid",
                transactionType: "refund",
                transactionId: refund.gatewayRefundId,
                user: refund.buyer,
            });
        } catch (error) {
            if (error.code !== 11000)
                throw error;

            payment = await findPaymentByGatewayTransaction({
                method: originalPayment.method,
                transactionId: refund.gatewayRefundId,
            });
        }
    }

    if (refund.status !== "resolved") {
        refund.status = "resolved";
        refund.resolvedAt = refund.resolvedAt || new Date();
        await refund.save();
    }

    return { success: true, payment };
};