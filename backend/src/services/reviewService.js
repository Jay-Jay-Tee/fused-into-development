import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Vendor } from "../models/Vendor.js";

import { AppError } from "../utils/appError.js";

export const createProductReviewService = async ({ userId, productId, rating, comment }) => {
    const product = await Product.findById(productId);

    if (!product)
        throw new AppError("Product not found", 404);

    // must have a delivered order containing this product.
    const eligibleOrder = await Order.findOne({
        buyer: userId,
        orderStatus: "delivered",
        "items.product": productId,
    });

    if (!eligibleOrder)
        throw new AppError("You can only review products from delivered orders", 400);

    // Prevent duplicate reviews for the same product by the same buyer.
    const existingReview = await Review.findOne({
        reviewer: userId,
        product: productId,
        reviewType: "product",
    });

    if (existingReview)
        throw new AppError("You have already reviewed this product", 400);

    const review = await Review.create({
        reviewer: userId,
        product: productId,
        reviewType: "product",
        rating,
        comment,
    });

    // Recompute and update the product's averageRating and totalReviews.
    const stats = await Review.aggregate([
        { $match: { product: product._id, reviewType: "product" } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].count,
        });
    }

    return review.toObject();
};

export const createVendorReviewService = async ({ userId, vendorId, rating, comment }) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor)
        throw new AppError("Vendor not found", 404);

    const eligibleOrder = await Order.findOne({
        buyer: userId,
        orderStatus: "delivered",
        "items.vendor": vendorId,
    });

    if (!eligibleOrder)
        throw new AppError("You can only review vendors from delivered orders", 400);

    const existingReview = await Review.findOne({
        reviewer: userId,
        vendor: vendorId,
        reviewType: "vendor",
    });

    if (existingReview)
        throw new AppError("You have already reviewed this vendor", 400);

    const review = await Review.create({
        reviewer: userId,
        vendor: vendorId,
        reviewType: "vendor",
        rating,
        comment,
    });

    // Recompute and update the vendor's averageRating.
    const stats = await Review.aggregate([
        { $match: { vendor: vendor._id, reviewType: "vendor" } },
        { $group: { _id: null, avgRating: { $avg: "$rating" },  count : { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
        await Vendor.findByIdAndUpdate(vendorId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].count,
        });
    }

    return review.toObject();
};

export const getProductReviewsService = async ({ productId }) => {
    return await Review.find({ product: productId, reviewType: "product" })
        .populate("reviewer", "name userName")
        .sort({ createdAt: -1 })
        .lean();
};

export const getVendorReviewsService = async ({ vendorId }) => {
    return await Review.find({ vendor: vendorId, reviewType: "vendor" })
        .populate("reviewer", "name userName")
        .sort({ createdAt: -1 })
        .lean();
};