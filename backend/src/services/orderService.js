import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { paginate } from "../utils/paginate.js";
import { AppError } from "../utils/appError.js";


export const createOrderService = async ({ userId, items, shippingAddress }) => {

    // Validate stock and fetch current prices for all items in one query.
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    // Build a map for O(1) lookup per item.
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = productMap[item.product.toString()];

        if (!product)
            throw new AppError(`Product not found: ${item.product}`, 404);
        if (product.stock < item.quantity) 
            throw new AppError(`Insufficient stock for: ${product.name}`, 400);

        subtotal += product.price * item.quantity;

        orderItems.push({
            product: product._id,
            vendor: product.vendor,
            name: product.name,
            image: product.images?.[0] || null,
            quantity: item.quantity,
            price: product.price,         // snapshot price at time of order
        });
    }

    // flat delivery fee - can be made dynamic later
    // in V2, when delivery partner is added, this will be calculated based on distance and package dimensions/weight
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
        buyer: userId,
        items: orderItems,
        shippingAddress,
        subtotal,
        deliveryFee,
        totalAmount,
        orderStatus: "pending",
    });

    return order.toObject();
};

export const getMyOrdersService = async ({ userId, query }) => {
    const { skip, limit, page } = paginate(query);

    const [orders, total] = await Promise.all([
        Order.find({ buyer: userId })
            .skip(skip)
            .limit(limit)
            .populate("items.product", "name images")
            .populate("payment", "status transactionType")
            .sort({ createdAt: -1 })
            .lean(),
        Order.countDocuments({ buyer: userId }),
    ]);

    return {
        orders,
        pagination: { total, page, pages: Math.ceil(total / limit) },
    };
};

// Returns all orders that contain at least one item from this vendor.
export const getVendorOrdersService = async ({ vendorId, query }) => {
    const { skip, limit, page } = paginate(query);

    const filter = { "items.vendor": vendorId };

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .skip(skip)
            .limit(limit)
            .populate("items.product", "name images")
            .populate("buyer", "name email")
            .sort({ createdAt: -1 })
            .lean(),
        Order.countDocuments(filter),
    ]);

    return {
        orders,
        pagination: { total, page, pages: Math.ceil(total / limit) },
    };
};

// (buyer owns it, or vendor has items in it) before calling this.
export const getOrderByIdService = async ({ userId, vendorId, orderId }) => {
    const order = await Order.findById(orderId)
        .populate("items.product", "name images price")
        .populate("buyer", "name email")
        .populate("payment", "status transactionType amount")
        .lean();

    if (!order)
        throw new AppError("Order not found", 404);

    const isBuyer     = order.buyer._id.toString() === userId;
    const vendorItems = order.items.filter(item => item.vendor.toString() === vendorId.toString());
    const isVendor    = vendorItems.length > 0;

    if (!isBuyer && !isVendor)
        throw new AppError("Order does not belong to user", 403);

    if (isVendor && !isBuyer)
        return { ...order, items: vendorItems };

    return order;
};

// Vendor updates the status of an order.
// Valid progression: pending -> confirmed -> shipped -> delivered.
// Cancelled can be set from pending or confirmed only.
export const updateOrderStatusService = async ({ orderId, status, vendorId }) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // Ensure at least one item in this order belongs to the requesting vendor.
    const vendorHasItem = order.items.some(
        item => item.vendor.toString() === vendorId.toString()
    );

    if (!vendorHasItem) {
        throw new AppError("Not authorised to update this order", 403);
    }

    const validTransitions = {
        pending:   ["confirmed", "cancelled"],
        confirmed: ["shipped", "cancelled"],
        shipped:   ["delivered"],
        delivered: [],
        cancelled: [],
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
        throw new AppError(`Cannot transition from ${order.orderStatus} to ${status}`, 400);
    }

    order.orderStatus = status;
    if (status === "delivered") order.deliveredAt = new Date();
    await order.save();

    return order.toObject();
};