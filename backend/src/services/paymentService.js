import crypto from "node:crypto";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Refund } from "../models/Refund.js";
import { AppError } from "../utils/appError.js";
import {
    buildCashfreeOrderId,
    createGatewayRefund,
    createGatewaySession,
    fetchCashfreeSuccessfulPayment,
    resolveCashfreeWebhook,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
} from "../utils/paymentGateway.js";
import {
    getReservationExpiryDate,
    releaseExpiredReservations,
    reserveStockForOrder,
    restoreReservedStock,
} from "../utils/paymentReservation.js";

const SYSTEM_ORDER_REFUND_REASON = "Late payment captured after reservation expiry";

const getOrderWithPayment = async (orderId) =>
    Order.findById(orderId).populate("payment");

const getIdValue = (value) => value?._id || value;

const buildPaymentSessionResponse = (payment) => {
    if (payment.method === "cashfree") {
        return {
            paymentType: "cashfree",
            cashfreeOrderId: buildCashfreeOrderId(getIdValue(payment.order)),
            paymentSessionId: payment.paymentSessionId,
            amount: payment.amount,
            currency: "INR",
            orderId: payment.order,
        };
    }

    return {
        paymentType: "razorpay",
        razorpayOrderId: payment.gatewayOrderId,
        amount: payment.amount,
        currency: "INR",
        orderId: payment.order,
    };
};

const assertOrderOwnership = (order, userId) => {
    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== userId)
        throw new AppError("Not authorized for this order", 403);
};

const isActiveReservation = (order) =>
    order.orderStatus === "payment_pending" &&
    order.reservationExpiresAt &&
    order.reservationExpiresAt > new Date() &&
    order.payment &&
    order.payment.status === "pending";

const getPaymentDoc = async (paymentRef) => {
    if (!paymentRef)
        return null;

    if (paymentRef.constructor?.modelName === "Payment")
        return paymentRef;

    return Payment.findById(paymentRef);
};

const findPaymentByGatewayTransaction = async ({ method, transactionId }) => {
    if (!transactionId)
        return null;

    return Payment.findOne({ method, transactionId });
};

const persistOrderPayment = async ({
    order,
    method,
    status,
    transactionId,
}) => {
    const paymentData = {
        amount: order.totalAmount,
        method,
        order: order._id,
        status,
        transactionType: "order",
        user: order.buyer,
    };

    if (transactionId)
        paymentData.transactionId = transactionId;

    let payment = await getPaymentDoc(order.payment);

    if (!payment) {
        try {
            payment = await Payment.create(paymentData);
        } catch (error) {
            if (error.code !== 11000)
                throw error;

            payment = await findPaymentByGatewayTransaction({
                method,
                transactionId,
            });
        }

        if (!payment)
            throw new AppError("Payment could not be persisted", 500);

        await Order.updateOne(
            { _id: order._id },
            { $set: { payment: payment._id } }
        );

        return payment;
    }

    payment.amount = paymentData.amount;
    payment.method = paymentData.method;
    payment.order = paymentData.order;
    payment.status = paymentData.status;
    payment.transactionType = paymentData.transactionType;
    payment.transactionId = paymentData.transactionId;
    payment.user = paymentData.user;
    payment.gatewayOrderId = undefined;
    payment.paymentSessionId = undefined;
    await payment.save();
    return payment;
};

const ensureSystemOrderRefund = async (order) => {
    let refund = await Refund.findOne({
        order: order._id,
        refundScope: "order",
        source: "system",
    });

    if (refund)
        return refund;

    refund = await Refund.create({
        buyer: order.buyer,
        order: order._id,
        reason: SYSTEM_ORDER_REFUND_REASON,
        refundAmount: order.totalAmount,
        refundScope: "order",
        source: "system",
        status: "approved",
    });

    return refund;
};

const handleLateCapturedPayment = async ({
    order,
    method,
    transactionId,
}) => {
    const payment = await persistOrderPayment({
        order,
        method,
        status: "paid",
        transactionId,
    });

    const refund = await ensureSystemOrderRefund(order);

    return {
        message: "Payment captured after reservation expiry. Refund queued.",
        payment,
        refund,
        success: true,
    };
};

const confirmReservedOrder = async ({
    order,
    method,
    transactionId,
}) => {
    const payment = await persistOrderPayment({
        order,
        method,
        status: "paid",
        transactionId,
    });

    const updated = await Order.findOneAndUpdate(
        { _id: order._id, orderStatus: "payment_pending" },
        {
            $set: {
                orderStatus: "confirmed",
                payment: payment._id,
            },
            $unset: { reservationExpiresAt: 1 },
        },
        { new: true }
    );

    if (!updated) {
        const refreshedOrder = await getOrderWithPayment(order._id);

        if (refreshedOrder?.orderStatus === "confirmed")
            return { message: "Already verified" };

        if (refreshedOrder?.orderStatus === "cancelled") {
            return handleLateCapturedPayment({
                order: refreshedOrder,
                method,
                transactionId,
            });
        }

        throw new AppError("Order is not available for confirmation", 409);
    }

    return { success: true, payment };
};

const resolveVerifiedPayment = async ({
    orderId,
    method,
    transactionId,
    userId,
}) => {
    let order = await getOrderWithPayment(orderId);

    if (!order)
        throw new AppError("Order not found", 404);

    if (userId && order.buyer.toString() !== userId)
        throw new AppError("Unauthorised attempt at verification", 401);

    if (
        order.orderStatus === "payment_pending" &&
        order.reservationExpiresAt &&
        order.reservationExpiresAt <= new Date()
    ) {
        await releaseExpiredReservations();
        order = await getOrderWithPayment(orderId);
    }

    if (order.orderStatus === "confirmed")
        return { message: "Already verified" };

    if (order.orderStatus === "cancelled") {
        return handleLateCapturedPayment({
            order,
            method,
            transactionId,
        });
    }

    if (order.orderStatus !== "payment_pending")
        throw new AppError("Order is not awaiting payment verification", 409);

    return confirmReservedOrder({
        order,
        method,
        transactionId,
    });
};

const getExistingRefundPayment = async (refund) =>
    Payment.findOne({
        refund: refund._id,
        transactionType: "refund",
    });

// actual services
export const createPaymentOrderService = async ({
    orderId,
    userId,
    paymentType = "razorpay",
}) => {
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
        {
            _id: orderId,
            buyer: userId,
            orderStatus: "pending",
        },
        { $set: { orderStatus: "payment_pending" } },
        { new: true }
    );

    if (!claimedOrder) {
        order = await getOrderWithPayment(orderId);
        assertOrderOwnership(order, userId);

        if (isActiveReservation(order))
            return buildPaymentSessionResponse(order.payment);

        if (order.orderStatus === "cancelled")
            throw new AppError("Order is cancelled. Create a new order to retry payment", 409);

        if (order.payment?.status === "paid" || order.orderStatus === "confirmed")
            throw new AppError("Order already paid", 409);

        throw new AppError("Order is not available for payment", 409);
    }

    try {
        await reserveStockForOrder(claimedOrder);
    } catch (error) {
        await Order.findByIdAndUpdate(
            claimedOrder._id,
            {
                $set: { orderStatus: "cancelled" },
                $unset: { reservationExpiresAt: 1 },
            }
        );
        throw error;
    }

    let payment = null;

    try {
        const session = await createGatewaySession({
            order: claimedOrder,
            paymentType,
        });

        const paymentData = {
            amount: claimedOrder.totalAmount,
            method: paymentType,
            order: claimedOrder._id,
            status: "pending",
            transactionType: "order",
            user: claimedOrder.buyer,
        };

        if (paymentType === "cashfree")
            paymentData.paymentSessionId = session.paymentSessionId;
        else
            paymentData.gatewayOrderId = session.gatewayOrderId;

        payment = await Payment.create(paymentData);

        await Order.findByIdAndUpdate(
            claimedOrder._id,
            {
                $set: {
                    payment: payment._id,
                    reservationExpiresAt: getReservationExpiryDate(),
                },
            }
        );

        return buildPaymentSessionResponse(payment);
    } catch (error) {
        await restoreReservedStock(claimedOrder.items);

        if (payment) {
            await Payment.findByIdAndUpdate(
                payment._id,
                { $set: { status: "failed" } }
            );
        }

        await Order.findByIdAndUpdate(
            claimedOrder._id,
            {
                $set: { orderStatus: "pending" },
                $unset: { reservationExpiresAt: 1 },
            }
        );

        throw error;
    }
};

export const verifyPaymentService = async ({
    orderId,
    paymentType = "razorpay",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    cashfreeOrderId,
    userId,
}) => {
    await releaseExpiredReservations();

    const order = await getOrderWithPayment(orderId);
    assertOrderOwnership(order, userId);

    if (order.payment?.method && order.payment.method !== paymentType)
        throw new AppError("Payment method mismatch for this order", 409);

    if (paymentType === "cashfree") {
        const resolvedCashfreeOrderId =
            cashfreeOrderId ||
            buildCashfreeOrderId(orderId);

        const capturedPayment = await fetchCashfreeSuccessfulPayment({
            cashfreeOrderId: resolvedCashfreeOrderId,
        });

        return resolveVerifiedPayment({
            orderId,
            method: "cashfree",
            transactionId: capturedPayment.cf_payment_id?.toString(),
            userId,
        });
    }

    if (
        order.payment?.gatewayOrderId &&
        order.payment.gatewayOrderId !== razorpayOrderId
    ) {
        throw new AppError("Gateway order ID does not match this order", 400);
    }

    if (
        order.orderStatus === "confirmed" &&
        order.payment?.transactionId &&
        order.payment.transactionId !== razorpayPaymentId
    ) {
        throw new AppError("Payment ID does not match this order", 400);
    }

    verifyRazorpayPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    });

    return resolveVerifiedPayment({
        orderId,
        method: "razorpay",
        transactionId: razorpayPaymentId,
        userId,
    });
};

export const triggerRefundService = async ({ refundId }) => {
    let refund = await Refund.findOneAndUpdate(
        {
            _id: refundId,
            status: "approved",
        },
        { $set: { status: "processing" } },
        { new: true }
    ).populate({
        path: "order",
        populate: { path: "payment" },
    });

    if (!refund) {
        refund = await Refund.findById(refundId).populate({
            path: "order",
            populate: { path: "payment" },
        });

        if (!refund)
            throw new AppError("Refund request not found", 404);

        if (refund.status === "resolved") {
            const existingPayment = await getExistingRefundPayment(refund);
            return { success: true, payment: existingPayment };
        }

        if (refund.status === "processing" && !refund.gatewayRefundId) {
            return { message: "Refund is already processing" };
        }

        if (refund.status !== "processing")
            throw new AppError("Refund must be approved before triggering payment", 400);
    }

    const originalPayment = refund.order.payment;

    if (originalPayment?.status !== "paid")
        throw new AppError("Original payment not found or not paid", 400);

    if (!refund.gatewayRefundId) {
        const { gatewayRefundId } = await createGatewayRefund({
            payment: originalPayment,
            refund,
            orderId: refund.order,
        });

        refund.gatewayRefundId = gatewayRefundId;
        await refund.save();
    }

    let payment = await getExistingRefundPayment(refund);

    if (!payment) {
        try {
            payment = await Payment.create({
                amount: refund.refundAmount,
                method: originalPayment.method,
                refund: refund._id,
                status: "paid",
                transactionType: "refund",
                transactionId: refund.gatewayRefundId,
                user: refund.buyer,
            });
        } catch (error) {
            if (error.code !== 11000)
                throw error;

            payment = await findPaymentByGatewayTransaction({
                method: originalPayment.method,
                transactionId: refund.gatewayRefundId,
            });
        }
    }

    if (refund.status !== "resolved") {
        refund.status = "resolved";
        refund.resolvedAt = refund.resolvedAt || new Date();
        await refund.save();
    }

    return { success: true, payment };
};

export const getPaymentsByOrderService = async ({ orderId }) => {
    const directPayments = await Payment.find({ order: orderId }).lean();

    const refundDocs = await Refund.find({ order: orderId }).select("_id").lean();
    const refundIds = refundDocs.map((refund) => refund._id);
    const refundPayments = refundIds.length > 0
        ? await Payment.find({
            transactionType: "refund",
            refund: { $in: refundIds },
        }).lean()
        : [];

    return [...directPayments, ...refundPayments];
};

export const getMyPaymentsService = async ({ userId }) => {
    return await Payment.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("order", "orderStatus totalAmount")
        .populate("refund", "reason refundAmount")
        .lean();
};

export const handleWebhookService = async ({
    paymentType = "razorpay",
    eventType,
    paymentId,
    orderId,
    razorpaySignature,
    webhookBody,
    cashfreeSignature,
    timestamp,
}) => {
    await releaseExpiredReservations();

    if (paymentType === "cashfree") {
        const resolved = resolveCashfreeWebhook({
            webhookBody,
            cashfreeSignature,
            timestamp,
        });

        if (resolved.eventType !== "PAYMENT_SUCCESS_WEBHOOK")
            return { message: "Event type not processed" };

        return resolveVerifiedPayment({
            orderId: resolved.orderId,
            method: "cashfree",
            transactionId: resolved.paymentId,
        });
    }

    verifyRazorpayWebhookSignature({
        razorpaySignature,
        webhookBody,
    });

    if (eventType !== "payment.captured")
        return { message: "Event type not processed" };

    return resolveVerifiedPayment({
        orderId,
        method: "razorpay",
        transactionId: paymentId,
    });
};

export const payUPIService = async ({ user, orderId }) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== user._id.toString())
        throw new AppError("Not authorised to access this order", 403);

    const txnId = crypto.randomUUID();

    const amount =
        process.env.NODE_ENV === "development"
            ? 1
            : order.totalAmount;

    const upiUrl =
        `upi://pay?` +
        `pa=${process.env.UPI_ID}` +
        `&pn=${encodeURIComponent(process.env.UPI_NAME || "VendorHub")}` +
        `&tr=${txnId}` +
        `&tn=${encodeURIComponent(`Order-${order._id}`)}` +
        `&am=${1}` +
        `&cu=INR`;

    return {
        orderId: order._id,
        txnId,
        amount,
        upiUrl,
    };
};

export const submitUPITransactionService = async ({
    user,
    orderId,
    utr,
}) => {
    const order = await Order.findById(orderId);

    if (!order)
        throw new AppError("Order not found", 404);

    if (order.buyer.toString() !== user._id.toString())
        throw new AppError("Not authorised", 403);

    if (!utr || utr.trim().length < 8)
        throw new AppError("Invalid transaction ID", 400);

    const existingUTR = await Payment.findOne({ utr });

    if (existingUTR)
        throw new AppError("Transaction ID already used", 400);

    let payment = await Payment.findOne({ order: order._id });

    if (payment) {
        if (payment.status === "paid" || payment.status === "pending_verification")
            throw new AppError("Order already paid", 400);

        await payment.deleteOne();
    }

    payment = await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        method: "upi",
        status: "pending_verification",
        transactionId: utr.toString(),
        transactionType: "order",
        user: order.buyer,
    });

    return payment;
};

export const approveUPIPaymentService = async ({
    admin,
    paymentId,
}) => {
    const payment = await Payment.findById(paymentId)
        .populate("order");

    if (!payment)
        throw new AppError("Payment not found", 404);

    payment.status = "paid";

    await payment.save();

    if (payment.order) {
        payment.order.orderStatus = "confirmed";
        await payment.order.save();
    }

    return payment;
};
