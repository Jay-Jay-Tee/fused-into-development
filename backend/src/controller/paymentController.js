import {
    createPaymentOrderService,
    verifyPaymentService,
    triggerRefundService,
    getPaymentsByOrderService,
    getMyPaymentsService,
    handleWebhookService,
    payUPIService,
    submitUPITransactionService,
    approveUPIPaymentService
} from "../services/paymentService.js";

const createOrder = async (req, res) => {
    const { orderId, paymentType } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: "orderId is required",
        });
    }

    const data = await createPaymentOrderService({
        orderId,
        userId: req.user.id,
        paymentType,
    });

    res.status(200).json({
        success: true,
        data,
    });
};

const verifyPayment = async (req, res) => {
    const {
        orderId,
        paymentType,
        // razorpay
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        // cashfree
        cashfreeOrderId,
    } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: "orderId is required",
        });
    }

    if (paymentType === "cashfree" && !cashfreeOrderId) {
        return res.status(400).json({
            success: false,
            message: "cashfreeOrderId is required for Cashfree payments",
        });
    }

    if (paymentType !== "cashfree" &&
        (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)) {
        return res.status(400).json({
            success: false,
            message: "orderId, razorpayOrderId, razorpayPaymentId and razorpaySignature are all required",
        });
    }

    const data = await verifyPaymentService({
        orderId,
        paymentType,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        cashfreeOrderId,
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
    const cashfreeSignature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const webhookBody = req.body; // raw Buffer from express.raw()

    if (!webhookBody) {
        return res.status(400).json({
            success: false,
            message: "Missing webhook body",
        });
    }

    // Detect provider from headers; Cashfree sends x-webhook-signature
    const paymentType = cashfreeSignature ? "cashfree" : "razorpay";

    let eventType, paymentId, orderId, amount;

    if (paymentType === "razorpay") {
        if (!razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Missing webhook parameters",
            });
        }

        const parsed = JSON.parse(webhookBody.toString());
        const { event, payload } = parsed;

        if (!event || !payload) {
            return res.status(400).json({
                success: false,
                message: "Missing webhook parameters",
            });
        }

        const receipt = payload.payment?.entity?.receipt;
        eventType = event;
        paymentId = payload.payment?.entity?.id;
        orderId = (receipt?.startsWith("order_")) ? receipt.slice(6) : receipt;
        amount = payload.payment?.entity?.amount;
    }

    const data = await handleWebhookService({
        paymentType,
        eventType,
        paymentId,
        orderId,
        amount,
        razorpaySignature,
        webhookBody, // raw Buffer, not re-stringified
        cashfreeSignature,
        timestamp,
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

const submitUPITransaction = async (req, res) => {
    const data = await submitUPITransactionService({
        user: req.user,
        orderId: req.params.orderId,
        utr: req.body.utr,
    });
    return res.status(200).json(data);
};

const approveUPIPayment = async (req, res) => {
    const data = await approveUPIPaymentService({
        admin: req.user,
        paymentId: req.params.paymentId,
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
    payUPI,
    submitUPITransaction,
    approveUPIPayment,
};