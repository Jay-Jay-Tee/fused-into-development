import { Order }        from "../models/Order.js";
import { Vendor }       from "../models/Vendor.js";
import { VendorPayout } from "../models/VendorPayouts.js";
import { AppError }     from "./appError.js";


// Computes and writes a VendorPayout document for a given vendor
// for a given month and year.

// Aggregates all delivered orders within the period that contain
// items from this vendor, computes totalRevenue, commissionDeducted,
// and totalOrders, then creates or updates the payout document.

// netAmount is NOT stored here, it lives on the
// payment document created when the payout is actually disbursed
export const calculateCommission = async ({ vendorId, month, year }) => {

    const vendor = await Vendor.findById(vendorId);

    if (!vendor)
        throw new AppError("Vendor not found", 404);

    // Build date range for the given month and year
    const from = new Date(year, month - 1, 1);           // first day of month
    const to = new Date(year, month, 0, 23, 59, 59);   // last day of month

    // Aggregate all delivered orders in the period with items from this vendor
    const result = await Order.aggregate([
        {
            // Only delivered orders in the date range.
            $match: {
                orderStatus: "delivered",
                deliveredAt: { $gte: from, $lte: to },
                "items.vendor": vendor._id,
            },
        },
        {
            // flatten items so we can filter and sum per vendor
            $unwind: "$items",
        },
        {
            // Keep only items belonging to this vendor.
            $match: { "items.vendor": vendor._id },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                orderIds: { $addToSet: "$_id" },   // unique order count
            },
        },
        {
            $project: {
                totalRevenue: 1,
                totalOrders: { $size: "$orderIds" },
            },
        },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;
    const totalOrders = result[0]?.totalOrders || 0;



    // stored in paise
    const commissionDeducted = Math.round((vendor.commission / 100) * totalRevenue);

    const payout = await VendorPayout.findOneAndUpdate(
        { vendor: vendorId, month, year },
        {
            $set: {
                totalRevenue,
                commissionDeducted,
                totalOrders,
                status: "pending",      // pending until disbursed via paymentService
            },
        },
        {
            upsert: true,       // create if not exists
            new: true,          // return the updated document
            runValidators: true,
        }
    );

    return payout.toObject();
};