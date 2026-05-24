import { Order } from "../models/Order.js";

export const createOrderService = async ({orderData}) => {
    const order = await Order.create(orderData);
    return order;
};

export const getMyOrdersService = async ({buyerId}) => {
    return await Order.find({ buyer: buyerId }).populate('items.product');
};

export const getVendorOrdersService = async ({vendorId}) => {
    return await Order.find({ "items.vendor": vendorId })
    .populate('items.product')
    .populate('buyer', 'name email')
    .lean();
};

export const getOrderByIdService = async ({orderId}) => {
    return await Order.findById(orderId)
    .populate('items.product')
    .populate('buyer', 'name email')
    .lean();
};

export const updateOrderStatusService = async ({orderId, status}) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    order.status = status;
    await order.save();
    return order;
}

