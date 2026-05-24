import { Product } from "../models/Product.js";
import { Vendor } from "../models/Vendor.js";
import { paginate } from "../utils/paginate.js";

export const getProductsService = async (query) => {
    const { page, limit, skip } = paginate(query);

    const filter = { isActive: true };

    if (query.category) filter.category = query.category;
    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }
    if (query.minRating) filter.averageRating = { $gte: Number(query.minRating) };

    if (query.search) filter.$text = { $search: query.search };

    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("vendor", "storeName averageRating")
        .populate("category", "name slug")
        .lean();

    const total = await Product.countDocuments(filter);

    return {
        products,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    };
};


// returns full product detail including vendor info and category
export const getProductByIdService = async ({ productId }) => {
    const product = await Product.findById(productId)
        .populate("vendor", "storeName logo averageRating")
        .populate("category", "name slug")
        .lean();

    if (!product) {
        throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    }

    return product;
};



// images are Cloudinary URLs - upload handled by upload middleware
// before this service is called, URLs passed in via productData
export const createProductService = async ({ userId, productData }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw new Error("Vendor profile not found");
    }

    if (!vendor.isApproved) {
        throw new Error("Vendor account is not approved yet");
    }

    const product = await Product.create({
        ...productData,
        vendor: vendor._id,
    });

    return product.toObject();
};

// Vendor updates one of their own products
// Ownership check: product.vendor must match the requesting vendor's _id
export const updateProductService = async ({ userId, productId, updateData }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw new Error("Vendor profile not found");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    if (product.vendor.toString() !== vendor._id.toString()) {
        throw new Error("Not authorised to edit this product");
    }

    // Apply only the fields passed in - don't overwrite everything.
    Object.assign(product, updateData);
    await product.save();

    return product.toObject();
};

export const deleteProductService = async ({ userId, productId }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw Object.assign(new Error("Vendor profile not found"), { statusCode: 404 });
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    }

    if (product.vendor.toString() !== vendor._id.toString()) {
        throw Object.assign(new Error("Not authorised to delete this product"), { statusCode: 403 });
    }

    product.isActive = false;
    await product.save();

    return { message: "Product removed from listing" };
};