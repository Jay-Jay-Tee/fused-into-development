import { Order }        from "../models/Order.js";
import { Vendor }       from "../models/Vendor.js";
import { Category }     from "../models/Category.js";
import { VendorPayout } from "../models/VendorPayouts.js";
import { AppError }     from "./appError.js";

export const calculateCommission = async ({ vendorId, month, year }) => {

    const vendor = await Vendor.findById(vendorId);
    if (!vendor)
        throw new AppError("Vendor not found", 404);

    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month, 0, 23, 59, 59);

    const orders = await Order.find({
        orderStatus: "delivered",
        deliveredAt: { $gte: from, $lte: to },
        "items.vendor": vendor._id,
    })
    .populate("items.product", "category")
    .lean();

    // Build a map of categoryId -> commission rate (null means use vendor default)
    const categories = await Category.find({}).select("_id commission").lean();
    const catRateMap = new Map();
    for (const c of categories) {
        if (c.commission !== null && c.commission !== undefined) {
            catRateMap.set(c._id.toString(), c.commission);
        }
    }

    let totalRevenue      = 0;
    let commissionDeducted = 0;
    const uniqueOrderIds  = new Set();

    for (const order of orders) {
        for (const item of order.items) {
            if (item.vendor.toString() !== vendor._id.toString()) continue;

            const itemRevenue = item.price * item.quantity;
            totalRevenue += itemRevenue;

            const categoryId = item.product?.category?.toString();
            const rate = (categoryId && catRateMap.has(categoryId))
                ? catRateMap.get(categoryId)
                : vendor.commission;

            commissionDeducted += Math.round((rate / 100) * itemRevenue);
            uniqueOrderIds.add(order._id.toString());
        }
    }

    const totalOrders = uniqueOrderIds.size;

    const payout = await VendorPayout.findOneAndUpdate(
        { vendor: vendorId, month, year },
        {
            $set: {
                totalRevenue,
                commissionDeducted,
                totalOrders,
                status: "pending",
            },
        },
        { upsert: true, new: true, runValidators: true }
    );

    return payout.toObject();
};
