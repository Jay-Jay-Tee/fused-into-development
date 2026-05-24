import {
    createPaymentOrderService,
    verifyPaymentService,
    triggerRefundService,
    getPaymentsByOrderService,
    getMyPaymentsService,
    handleWebhookService,
} from "../services/paymentService.js";

const createOrder = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: "orderId is required",
        });
    }

    const data = await createPaymentOrderService({
        orderId,
        userId: req.user.id,
    });

    res.status(200).json({
        success: true,
        data,
    });
};

const verifyPayment = async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
            success: false,
            message: "orderId, razorpayOrderId, razorpayPaymentId and razorpaySignature are all required",
        });
    }

    const data = await verifyPaymentService({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId: req.user.id,
    });

    res.status(200).json({
        success: true,
        data,
    });
};

const triggerRefund = async (req, res) => {
    const { refundId } = req.params;
    
    const data = await triggerRefundService({ refundId });

    res.status(200).json({
        success: true,
        data,
    });
};

// ---- GET /api/payments/order/:orderId --------------------

const getPaymentHistoryById = async (req, res) => {
    const { orderId } = req.params;

    const data = await getPaymentsByOrderService({ orderId });

    res.status(200).json({
        success: true,
        data,
    });
};

// ---- GET /api/payments/my --------------------

const getPaymentHistory = async (req, res) => {
    const data = await getMyPaymentsService({ userId: req.user.id });

    res.status(200).json({
        success: true,
        data,
    });
};

// ---- POST /api/payments/webhook --------------------

const handleWebhook = async (req, res) => {
    const { event, payload } = req.body;
    const razorpaySignature = req.headers["x-razorpay-signature"];

    if (!event || !payload || !razorpaySignature) {
        return res.status(400).json({
            success: false,
            message: "Missing webhook parameters",
        });
    }

    const data = await handleWebhookService({
        eventType: event,
        paymentId: payload.payment?.entity?.id,
        orderId: payload.payment?.entity?.receipt,
        amount: payload.payment?.entity?.amount,
        razorpaySignature,
        webhookBody: JSON.stringify(req.body),
    });

    res.status(200).json({
        success: true,
        data,
    });
};

export const paymentController = {
    createOrder,
    verifyPayment,
    triggerRefund,
    getPaymentHistoryById,
    getPaymentHistory,
    handleWebhook,
};