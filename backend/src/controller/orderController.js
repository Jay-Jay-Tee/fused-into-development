import { createOrderService, getMyOrdersService, getVendorOrdersService, getOrderByIdService, updateOrderStatusService } from "../services/orderService.js";

const createOrder = async (req, res) => {
    const orderData = req.body;
    orderData.buyer = req.user.userId; 
    const order = await createOrderService({ orderData });
    return res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
    const buyerId = req.user.userId;
    const orders = await getMyOrdersService({ buyerId });
    return res.status(200).json(orders);
};

const getVendorOrders = async (req, res) => {
    const vendorId = req.user.userId;
    const orders = await getVendorOrdersService({ vendorId });
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
    const order = await updateOrderStatusService({ orderId, status });
    return res.status(200).json(order);
}