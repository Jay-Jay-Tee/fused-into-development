import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Product } from "../models/Product.js";
import { AppError } from "./appError.js";

export const RESERVATION_TTL_MS = 10 * 60 * 1000;
export const RESERVATION_CLEANUP_INTERVAL_MS = 60 * 1000;

let cleanupTimer = null;

export const getReservationExpiryDate = () =>
    new Date(Date.now() + RESERVATION_TTL_MS);

export const restoreReservedStock = async (items = []) => {
    for (const item of items) {
        await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } }
        );
    }
};

export const reserveStockForOrder = async (order) => {
    const reservedItems = [];

    for (const item of order.items) {
        const result = await Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
        );

        if (result.modifiedCount !== 1) {
            await restoreReservedStock(reservedItems);
            throw new AppError(`Insufficient stock for: ${item.name}`, 409);
        }

        reservedItems.push(item);
    }
};

export const releaseExpiredReservations = async ({ now = new Date() } = {}) => {
    const expiringOrders = await Order.find({
        orderStatus: "payment_pending",
        reservationExpiresAt: { $lte: now },
    }).select("_id");

    let released = 0;

    for (const expiringOrder of expiringOrders) {
        const claimedOrder = await Order.findOneAndUpdate(
            {
                _id: expiringOrder._id,
                orderStatus: "payment_pending",
                reservationExpiresAt: { $lte: now },
            },
            {
                $set: { orderStatus: "cancelled" },
                $unset: { reservationExpiresAt: 1 },
            },
            { new: true }
        );

        if (!claimedOrder)
            continue;

        await restoreReservedStock(claimedOrder.items);

        if (claimedOrder.payment) {
            await Payment.updateOne(
                { _id: claimedOrder.payment, status: "pending" },
                { $set: { status: "failed" } }
            );
        }

        released += 1;
    }

    return released;
};

export const startReservationCleanupLoop = () => {
    if (cleanupTimer)
        return cleanupTimer;

    cleanupTimer = setInterval(() => {
        releaseExpiredReservations().catch((error) => {
            console.error("Reservation cleanup failed:", error.message);
        });
    }, RESERVATION_CLEANUP_INTERVAL_MS);

    if (typeof cleanupTimer.unref === "function")
        cleanupTimer.unref();

    return cleanupTimer;
};
