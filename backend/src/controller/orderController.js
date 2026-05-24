import { createOrderService, getMyOrdersService, getVendorOrdersService, getOrderByIdService, updateOrderStatusService } from "../services/orderService.js";
import { Vendor } from "../models/Vendor.js";

const createOrder = async (req, res) => {
    const { items, shippingAddress } = req.body; 
    const order = await createOrderService({ userId: req.user.id, items, shippingAddress });
    return res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
   const orders = await getMyOrdersService({ userId: req.user.id, query: req.query });
    return res.status(200).json(orders);
};

const getVendorOrders = async (req, res) => {
    const vendor = await Vendor.findOne({ user: req.user.id }).select("_id");
    if (!vendor)
        return res.status(404).json({ success: false, message: "Vendor profile not found" });
    const orders = await getVendorOrdersService({ vendorId: vendor._id, query: req.query });
    return res.status(200).json(orders);
};

const getOrderById = async (req, res) => {
    const orderId = req.params.id;
    const order = await getOrderByIdService({ orderId });
    return res.status(200).json(order);
};

const updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    const vendor = await Vendor.findOne({ user: req.user.id }).select("_id");
    if (!vendor)
        return res.status(404).json({ success: false, message: "Vendor profile not found" });
    const order = await updateOrderStatusService({ orderId, status, vendorId: vendor._id });
    return res.status(200).json(order);
};

export const orderController = {
    createOrder,
    getMyOrders,
    getVendorOrders,
    getOrderById,
    updateOrderStatus
};