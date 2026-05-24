import { Order } from "../models/Order.js";
import { VendorPayout } from "../models/VendorPayouts.js";
import { Vendor } from "../models/Vendor.js";
import { Category } from "../models/Category.js";

// analytics service
export const getAnalyticsService = async ({ }) => {

    // its unfortunately messed up 
    const totalSales = (await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$price" }
            }
        }
    ]))[0]?.total || 0;

    const topVendors = (await VendorPayout.aggregate([
        {
            $group: {
                _id: "$vendor",
                total: { $sum: "$paymentInfo.amount" }
            }
        },
        {
            $sort: { total: -1 }
        },
        {
            $limit: 5
        }
    ])) || [];

    // more stuff to return added later
    return { totalSales, topVendors };
};

// pending vendors service
export const getPendingVendorsService = async ({ }) => {
    return (await Vendor.find({ isApproved: false }).lean());
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
        throw new Error("Name and slug are required");
    }

    // check if category already exists
    const existingCategory = await Category.findOne({
        $or: [
            { name },
            { slug }
        ]
    });

    if (existingCategory) {
        throw new Error("Category already exists");
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
            commission : commissionPercent
        }
    })
    ).modifiedCount;
    return updatedCount;
};