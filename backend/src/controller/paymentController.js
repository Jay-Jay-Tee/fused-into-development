import {
    createPaymentOrderService,
    verifyPaymentService,
    triggerRefundService,
    getPaymentsByOrderService,
    getMyPaymentsService,
    handleWebhookService,
    payUPIService
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
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const webhookBody = req.body;                        // raw Buffer from express.raw()

    if (!razorpaySignature || !webhookBody) {
        return res.status(400).json({
            success: false,
            message: "Missing webhook parameters",
        });
    }

    const parsed  = JSON.parse(webhookBody.toString());
    const { event, payload } = parsed;

    if (!event || !payload) {
        return res.status(400).json({
            success: false,
            message: "Missing webhook parameters",
        });
    }

    const receipt = payload.payment?.entity?.receipt;
    const orderId = receipt?.startsWith("order_") ? receipt.slice(6) : receipt;

    const data = await handleWebhookService({
        eventType: event,
        paymentId: payload.payment?.entity?.id,
        orderId,
        amount: payload.payment?.entity?.amount,
        razorpaySignature,
        webhookBody,                                     // raw Buffer, not re-stringified
    });

    res.status(200).json({
        success: true,
        data,
    });
};

const payUPI = async (req, res) => {
    const data = await payUPIService({
        user: req.user,
        orderId: req.params.orderId,
    });
    return res.status(200).json(data);
};

export const paymentController = {
    createOrder,
    verifyPayment,
    triggerRefund,
    getPaymentHistoryById,
    getPaymentHistory,
    handleWebhook,
    payUPI
};