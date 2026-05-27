import {
    createPaymentOrderService,
    verifyPaymentService,
    getPaymentsByOrderService,
    getMyPaymentsService,
    handleWebhookService,
} from "../services/paymentService.js";
import { triggerRefundService } from "../services/refundService.js";
import {
    payUPIService,
    submitUPITransactionService,
    approveUPIPaymentService,
} from "../services/upiService.js";

const createOrder = async (req, res) => {
    const { orderId, paymentType } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const data = await createPaymentOrderService({ orderId, userId: req.user.id, paymentType });
    res.status(200).json({ success: true, data });
};

const verifyPayment = async (req, res) => {
    const {
        orderId, paymentType,
        razorpayOrderId, razorpayPaymentId, razorpaySignature,
        cashfreeOrderId,
    } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "orderId is required" });
    }

    if (paymentType !== "cashfree" && (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)) {
        return res.status(400).json({ success: false, message: "orderId, razorpayOrderId, razorpayPaymentId and razorpaySignature are all required" });
    }

    const data = await verifyPaymentService({ orderId, paymentType, razorpayOrderId, razorpayPaymentId, razorpaySignature, cashfreeOrderId, userId: req.user.id });
    res.status(200).json({ success: true, data });
};

const triggerRefund = async (req, res) => {
    const data = await triggerRefundService({ refundId: req.params.refundId });
    res.status(200).json({ success: true, data });
};

const getPaymentHistoryById = async (req, res) => {
    const data = await getPaymentsByOrderService({ orderId: req.params.orderId, userId: req.user.id });
    res.status(200).json({ success: true, data });
};

const getPaymentHistory = async (req, res) => {
    const data = await getMyPaymentsService({ userId: req.user.id });
    res.status(200).json({ success: true, data });
};

const handleWebhook = async (req, res) => {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const cashfreeSignature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const webhookBody = req.body;

    if (!webhookBody) {
        return res.status(400).json({ success: false, message: "Missing webhook body" });
    }

    const paymentType = cashfreeSignature ? "cashfree" : "razorpay";
    let eventType, paymentId, orderId;

    if (paymentType === "razorpay") {
        if (!razorpaySignature) {
            return res.status(400).json({ success: false, message: "Missing webhook parameters" });
        }

        const { event, payload } = JSON.parse(webhookBody.toString());

        if (!event || !payload) {
            return res.status(400).json({ success: false, message: "Missing webhook parameters" });
        }

        const receipt = payload.payment?.entity?.receipt;
        eventType = event;
        paymentId = payload.payment?.entity?.id;
        orderId = receipt?.startsWith("order_") ? receipt.slice(6) : receipt;
    }

    const data = await handleWebhookService({ paymentType, eventType, paymentId, orderId, razorpaySignature, webhookBody, cashfreeSignature, timestamp });
    res.status(200).json({ success: true, data });
};

const payUPI = async (req, res) => {
    const data = await payUPIService({ user: req.user, orderId: req.params.orderId });
    return res.status(200).json(data);
};

const submitUPITransaction = async (req, res) => {
    const data = await submitUPITransactionService({ user: req.user, orderId: req.params.orderId, utr: req.body.utr });
    return res.status(200).json(data);
};

const approveUPIPayment = async (req, res) => {
    const data = await approveUPIPaymentService({ admin: req.user, paymentId: req.params.paymentId });
    return res.status(200).json(data);
};

export const paymentController = {
    createOrder,
    verifyPayment,
    triggerRefund,
    getPaymentHistoryById,
    getPaymentHistory,
    handleWebhook,
    payUPI,
    submitUPITransaction,
    approveUPIPayment,
};