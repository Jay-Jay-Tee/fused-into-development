import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Refund } from "../models/Refund.js";
import { AppError } from "../utils/appError.js";
import {
    buildCashfreeOrderId,
    createGatewaySession,
    fetchCashfreeSuccessfulPayment,
    persistOrderPayment,
    resolveCashfreeWebhook,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
} from "../utils/paymentGateway.js";
import {
    ensureSystemOrderRefund,
    getReservationExpiryDate,
    releaseExpiredReservations,
    reserveStockForOrder,
    restoreReservedStock,
} from "../utils/paymentReservation.js";

// -- Helpers -----------------------------------------------------------------

const getOrderWithPayment = async (orderId) =>
    Order.findById(orderId).populate("payment");

const assertOrderOwnership = (order, userId) => {
    if (!order)
        throw new AppError("Order not found", 404);

    if (!userId)
        throw new AppError("User not found", 404);

    if (order.buyer.toString() !== userId)
        throw new AppError("Not authorized for this order", 403);
};

const isActiveReservation = (order) =>
    order.orderStatus === "payment_pending" &&
    order.reservationExpiresAt > new Date() &&
    order.payment?.status === "pending";

const buildPaymentSessionResponse = (payment) => {
    const base = { amount: payment.amount, currency: "INR", orderId: payment.order };

    if (payment.method === "cashfree") {
        const orderId = payment.order?._id || payment.order;
        return { ...base, paymentType: "cashfree", cashfreeOrderId: buildCashfreeOrderId(orderId), paymentSessionId: payment.paymentSessionId };
    }

    return { ...base, paymentType: "razorpay", razorpayOrderId: payment.gatewayOrderId };
};

// -- Order confirmation state machine ----------------------------------------

const handleLateCapturedPayment = async ({ order, method, transactionId }) => {
    const payment = await persistOrderPayment({ order, method, status: "paid", transactionId });
    const refund = await ensureSystemOrderRefund(order);
    return { message: "Payment captured after reservation expiry. Refund queued.", payment, refund, success: true };
};

const confirmReservedOrder = async ({ order, method, transactionId }) => {
    const payment = await persistOrderPayment({ order, method, status: "paid", transactionId });

    const updated = await Order.findOneAndUpdate(
        { _id: order._id, orderStatus: "payment_pending" },
        { $set: { orderStatus: "confirmed", payment: payment._id }, $unset: { reservationExpiresAt: 1 } },
        { new: true }
    );

    if (!updated) {
        const refreshed = await getOrderWithPayment(order._id);

        if (refreshed?.orderStatus === "confirmed")
            return { message: "Already verified" };

        if (refreshed?.orderStatus === "cancelled")
            return handleLateCapturedPayment({ order: refreshed, method, transactionId });

        throw new AppError("Order is not available for confirmation", 409);
    }

    return { success: true, payment };
};

const resolveVerifiedPayment = async ({ orderId, method, transactionId, userId }) => {
    let order = await getOrderWithPayment(orderId);
    assertOrderOwnership(order, userId);

    if (order.orderStatus === "payment_pending" && order.reservationExpiresAt <= new Date()) {
        await releaseExpiredReservations();
        order = await getOrderWithPayment(orderId);
    }

    if (order.orderStatus === "confirmed")
        return { message: "Already verified" };

    if (order.orderStatus === "cancelled")
        return handleLateCapturedPayment({ order, method, transactionId });

    if (order.orderStatus !== "payment_pending")
        throw new AppError("Order is not awaiting payment verification", 409);

    return confirmReservedOrder({ order, method, transactionId });
};

// -- Exported services -------------------------------------------------------

export const createPaymentOrderService = async ({ orderId, userId, paymentType = "razorpay" }) => {
    await releaseExpiredReservations();

    let order = await getOrderWithPayment(orderId);
    assertOrderOwnership(order, userId);

    if (order.payment?.status === "paid" || order.orderStatus === "confirmed")
        throw new AppError("Order already paid", 409);

    if (order.orderStatus === "cancelled")
        throw new AppError("Order is cancelled. Create a new order to retry payment", 409);

    if (isActiveReservation(order))
        return buildPaymentSessionResponse(order.payment);

    const claimedOrder = await Order.findOneAndUpdate(
        { _id: orderId, buyer: userId, orderStatus: "pending" },
        { $set: { orderStatus: "payment_pending" } },
        { new: true }
    );

    if (!claimedOrder) {
        order = await getOrderWithPayment(orderId);
        assertOrderOwnership(order, userId);

        if (isActiveReservation(order)) return buildPaymentSessionResponse(order.payment);
        if (order.orderStatus === "cancelled") throw new AppError("Order is cancelled. Create a new order to retry payment", 409);
        if (order.payment?.status === "paid" || order.orderStatus === "confirmed") throw new AppError("Order already paid", 409);

        throw new AppError("Order is not available for payment", 409);
    }

    try {
        await reserveStockForOrder(claimedOrder);
    } catch (error) {
        await Order.findByIdAndUpdate(claimedOrder._id, { $set: { orderStatus: "cancelled" }, $unset: { reservationExpiresAt: 1 } });
        throw error;
    }

    let payment = null;

    try {
        const session = await createGatewaySession({ order: claimedOrder, paymentType });

        payment = await Payment.create({
            amount: claimedOrder.totalAmount,
            method: paymentType,
            order: claimedOrder._id,
            status: "pending",
            transactionType: "order",
            user: claimedOrder.buyer,
            ...(paymentType === "cashfree"
                ? { paymentSessionId: session.paymentSessionId }
                : { gatewayOrderId: session.gatewayOrderId }),
        });

        await Order.findByIdAndUpdate(claimedOrder._id, {
            $set: { payment: payment._id, reservationExpiresAt: getReservationExpiryDate() },
        });

        return buildPaymentSessionResponse(payment);
    } catch (error) {
        await restoreReservedStock(claimedOrder.items);

        if (payment)
            await Payment.findByIdAndUpdate(payment._id, { $set: { status: "failed" } });

        await Order.findByIdAndUpdate(claimedOrder._id, { $set: { orderStatus: "pending" }, $unset: { reservationExpiresAt: 1 } });

        throw error;
    }
};

export const verifyPaymentService = async ({
    orderId, paymentType = "razorpay",
    razorpayOrderId, razorpayPaymentId, razorpaySignature,
    cashfreeOrderId, userId,
}) => {
    await releaseExpiredReservations();

    const order = await getOrderWithPayment(orderId);
    assertOrderOwnership(order, userId);

    if (order.payment?.method && order.payment.method !== paymentType)
        throw new AppError("Payment method mismatch for this order", 409);

    if (paymentType === "cashfree") {
        const captured = await fetchCashfreeSuccessfulPayment({
            cashfreeOrderId: cashfreeOrderId || buildCashfreeOrderId(orderId),
        });
        return resolveVerifiedPayment({ orderId, method: "cashfree", transactionId: captured.cf_payment_id?.toString(), userId });
    }

    if (order.payment?.gatewayOrderId && order.payment.gatewayOrderId !== razorpayOrderId)
        throw new AppError("Gateway order ID does not match this order", 400);

    if (order.orderStatus === "confirmed" && order.payment?.transactionId && order.payment.transactionId !== razorpayPaymentId)
        throw new AppError("Payment ID does not match this order", 400);

    verifyRazorpayPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });

    return resolveVerifiedPayment({ orderId, method: "razorpay", transactionId: razorpayPaymentId, userId });
};

export const getPaymentsByOrderService = async ({ orderId }) => {
    const directPayments = await Payment.find({ order: orderId }).lean();
    const refundDocs = await Refund.find({ order: orderId }).select("_id").lean();
    const refundIds = refundDocs.map((r) => r._id);
    const refundPayments = refundIds.length > 0
        ? await Payment.find({ transactionType: "refund", refund: { $in: refundIds } }).lean()
        : [];

    return [...directPayments, ...refundPayments];
};

export const getMyPaymentsService = async ({ userId }) =>
    Payment.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("order", "orderStatus totalAmount")
        .populate("refund", "reason refundAmount")
        .lean();

export const handleWebhookService = async ({
    paymentType = "razorpay", eventType, paymentId, orderId,
    razorpaySignature, webhookBody, cashfreeSignature, timestamp,
}) => {
    await releaseExpiredReservations();

    if (paymentType === "cashfree") {
        const resolved = resolveCashfreeWebhook({ webhookBody, cashfreeSignature, timestamp });

        if (resolved.eventType !== "PAYMENT_SUCCESS_WEBHOOK")
            return { message: "Event type not processed" };

        return resolveVerifiedPayment({ orderId: resolved.orderId, method: "cashfree", transactionId: resolved.paymentId });
    }

    verifyRazorpayWebhookSignature({ razorpaySignature, webhookBody });

    if (eventType !== "payment.captured")
        return { message: "Event type not processed" };

    return resolveVerifiedPayment({ orderId, method: "razorpay", transactionId: paymentId });
};