import { Order }                from "../models/Order.js";
import { VendorPayout }         from "../models/VendorPayouts.js";
import { Vendor }               from "../models/Vendor.js";
import { Category }             from "../models/Category.js";
import { calculateCommission }  from "../utils/calculateCommission.js";
import { Payment }              from "../models/Payment.js";
import { AppError }             from "../utils/appError.js";

// analytics service
export const getAnalyticsService = async () => {

    // its unfortunately messed up 
    const totalSales = (await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$totalAmount" }
            }
        }
    ]))[0]?.total || 0;

const topVendors = await VendorPayout.aggregate([
        {
            $lookup: {
                from:         "payments",
                localField:   "paymentInfo",
                foreignField: "_id",
                as:           "payment"
            }
        },
        { $unwind: "$payment" },
        {
            $group: {
                _id:   "$vendor",
                total: { $sum: "$payment.amount" }
            }
        },
        { $sort:  { total: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from:         "vendors",
                localField:   "_id",
                foreignField: "_id",
                as:           "vendorInfo"
            }
        },
        { $unwind: "$vendorInfo" },
        {
            $project: {
                total:     1,
                storeName: "$vendorInfo.storeName",
                logo:      "$vendorInfo.logo"
            }
        }
    ]) || [];

    // more stuff to return added later
    return { totalSales, topVendors };
};

// pending vendors service
export const getPendingVendorsService = async () => {
    return await Vendor.find({ isApproved: false })
        .populate("user", "name email phone")
        .populate("categories")
        .lean();
}

// add new category
export const createCategoryService = async ({
    name,
    slug,
    icon,
    parentCategory,
    isActive
}) => {

    if (!name || !slug) {
        throw new AppError("Name and slug are required", 400);
    }

    // check if category already exists
    const existingCategory = await Category.findOne({
        $or: [
            { name },
            { slug }
        ]
    });

    if (existingCategory) {
        throw new AppError("Category with the same name or slug already exists", 409);
    }

    // create category
    const category = await Category.create({
        name,
        slug,
        icon,
        parentCategory: parentCategory || null,
        isActive
    });

    return category.toObject();
};

// update commission for everyone
export const updateCommissionService = async ({
    commissionPercent
}) => {

    const updatedCount = (await Vendor.updateMany({}, {
        $set: {
            commission: commissionPercent
        }
    })
    ).modifiedCount;
    return updatedCount;
};

// disburse payout for a vendor for a given month/year
export const disbursePayoutService = async ({ vendorId, month, year }) => {

    const existingPayout = await VendorPayout.findOne({ vendor: vendorId, month, year });
    if (existingPayout?.status === "paid") {
        throw new AppError("Payout for this period has already been disbursed", 400);
    }

    const payout = await calculateCommission({ vendorId, month, year });

    if (payout.totalRevenue === 0) {
        throw new AppError("No revenue to disburse for this period", 400);
    }
 
    const netAmount = Number.parseFloat((payout.totalRevenue - payout.commissionDeducted).toFixed(2));
    const vendor = await Vendor.findById(vendorId).select("user");

    const payment = await Payment.create({
        user:            vendor.user,
        amount:          netAmount,
        method:          "bank_transfer",
        transactionType: "payout",
        transactionId:   `payout_${vendorId}_${month}_${year}_${Date.now()}`,
        status:          "paid",
    });
 
    await VendorPayout.findByIdAndUpdate(payout._id, {
        $set: {
            status:      "paid",
            paymentInfo: payment._id,
        },
    });
 
    return {
        message:   "Payout disbursed successfully",
        netAmount,
        paymentId: payment._id,
    };
};
 
// get all payouts, filterable by vendor or status
export const getPayoutsService = async ({ vendorId, status }) => {
    const filter = {};
    if (vendorId) filter.vendor = vendorId;
    if (status)   filter.status = status;
 
    return await VendorPayout.find(filter)
        .populate("vendor", "storeName")
        .populate("paymentInfo", "amount status transactionId")
        .sort({ year: -1, month: -1 })
        .lean();
};