import { Refund } from "../models/Refund.js";
import { Order } from "../models/Order.js";


export const createRefundService = async ({ userId, orderId, itemId, reason }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new Error("Order not found");

    if (order.buyer.toString() !== userId)
        throw new Error("Not authorised for this order");

    if (order.orderStatus !== "delivered")
        throw new Error("Refunds can only be raised for delivered orders");

    // Find the specific item within the order by matching product id.
    const item = order.items.find(i => i.product.toString() === itemId);

    if (!item) 
        throw new Error("Item not found in this order");

    // check no existing pending/approved refund for this item in this order
    const existingRefund = await Refund.findOne({
        order: orderId,
        "item.product": itemId,
        status: { $in: ["pending", "approved"] },
    });

    if (existingRefund)
        throw new Error("A refund request already exists for this item")

    // refundAmount is price * quantity from the order snapshot, for now
    const refundAmount = item.price * item.quantity;

    const refund = await Refund.create({
        order: orderId,
        item,
        reason,
        refundAmount,
        buyer: userId,
        status: "pending",
    });

    return refund.toObject();
};

export const getMyRefundsService = async ({ userId }) => {
    return await Refund.find({ buyer: userId })
        .populate("order", "orderStatus totalAmount")
        .sort({ createdAt: -1 })
        .lean();
};

export const getAllRefundsService = async ({ status }) => {
    const filter = {};
    if (status) filter.status = status;

    return await Refund.find(filter)
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

    if (!refund) {
        throw Object.assign(new Error("Refund request not found"), { statusCode: 404 });
    }

    return refund;
};

// Admin approves a refund request.
// Sets status to "approved". The actual Razorpay refund payment is
// triggered separately via POST /api/payments/refund/:refundId
// called internally by paymentService — not from here.
export const approveRefundService = async ({ refundId, adminNote }) => {
    const refund = await Refund.findById(refundId);

    if (!refund) 
        throw new Error("Refund request not found");

    if (refund.status !== "pending") 
        throw new Error(`Refund is already ${refund.status}`);
    
    refund.status = "approved";
    if (adminNote) refund.adminNote = adminNote;
    await refund.save();

    return refund.toObject();
};

export const rejectRefundService = async ({ refundId }) => {
    const refund = await Refund.findById(refundId);

    if (!refund) 
        throw new Error("Refund request not found");

    if (refund.status !== "pending")
        throw new Error(`Refund is already ${refund.status}`);

    refund.status = "rejected";
    await refund.save();

    return refund.toObject();
};