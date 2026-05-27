import { Order }                from "../models/Order.js";
import { VendorPayout }         from "../models/VendorPayouts.js";
import { Vendor }               from "../models/Vendor.js";
import { Category }             from "../models/Category.js";
import { User }                 from "../models/User.js";
import { calculateCommission }  from "../utils/calculateCommission.js";
import { Payment }              from "../models/Payment.js";
import { AppError }             from "../utils/appError.js";
import { paginate }             from "../utils/paginate.js";

// analytics service
export const getAnalyticsService = async () => {

    // its unfortunately messed up 
    const totalSales = (await Order.aggregate([
        { $match: { orderStatus: { $in: ['confirmed', 'shipped', 'delivered'] } } },
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

export const getCommissionService = async () => {
    const vendor = await Vendor.findOne({}).select('commission').lean();
    return { commissionPercent: vendor?.commission ?? 10 };
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

export const getUsersService = async ({ role, isBanned, query }) => {
    const { skip, limit, page } = paginate(query);
    const filter = {};
    if (role)              filter.role     = role;
    if (isBanned != null)  filter.isBanned = isBanned === "true";

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean(),
        User.countDocuments(filter),
    ]);

    return { users, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

export const getUserByIdService = async ({ userId }) => {
    const user = await User.findById(userId).select("-password").lean();
    if (!user) throw new AppError("User not found", 404);
    return user;
};

export const banUserService = async ({ userId, ban }) => {
    const user = await User.findById(userId);
    if (!user)                 throw new AppError("User not found", 404);
    if (user.role === "admin") throw new AppError("Cannot ban an admin account", 403);
    user.isBanned = ban;
    await user.save();
    return { message: ban ? "User banned" : "User unbanned", userId: user._id };
};

export const getAdminOrdersService = async ({ status, from, to, query }) => {
    const { skip, limit, page } = paginate(query);
    const filter = {};
    if (status) filter.orderStatus = status;
    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to)   filter.createdAt.$lte = new Date(to);
    }

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .skip(skip)
            .limit(limit)
            .populate("buyer", "name email")
            .populate("items.product", "name")
            .sort({ createdAt: -1 })
            .lean(),
        Order.countDocuments(filter),
    ]);

    return { orders, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

export const updateCategoryService = async ({ categoryId, updateData }) => {
    const category = await Category.findById(categoryId);
    if (!category)
        throw new AppError("Category not found", 404);
    Object.assign(category, updateData);
    await category.save();
    return category.toObject();
};
export const deleteCategoryService = async ({ categoryId }) => {
    const category = await Category.findById(categoryId);
    if (!category)
        throw new AppError("Category not found", 404);
    category.isActive = false;
    await category.save();
    return { message: "Category deactivated" };
};