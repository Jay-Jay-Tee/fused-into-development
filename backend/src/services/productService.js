import { Product } from "../models/Product.js";
import { Vendor } from "../models/Vendor.js";
import { paginate } from "../utils/paginate.js";
import { AppError } from "../utils/appError.js";

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

    if (!product)
        throw new AppError("Product not found", 404);

    return product;
};



// images are Cloudinary URLs - upload handled by upload middleware
// before this service is called, URLs passed in via productData
export const createProductService = async ({ userId, productData }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw new AppError("Vendor profile not found", 404);
    }

    if (!vendor.isApproved) {
        throw new AppError("Vendor account is not approved yet", 403);
    }

    const { name, description, images, price, stock, category } = productData;
    const product = await Product.create({
        name, description, images, price, stock, category,
        vendor: vendor._id,
    });

    return product.toObject();
};

// Vendor updates one of their own products
// Ownership check: product.vendor must match the requesting vendor's _id
export const updateProductService = async ({ userId, productId, updateData }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw new AppError("Vendor profile not found", 404);
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (product.vendor.toString() !== vendor._id.toString()) {
        throw new AppError("Not authorised to edit this product", 403);
    }

    const allowed = ['name', 'description', 'images', 'price', 'stock', 'category'];
    for (const key of allowed) {
        if (updateData[key] !== undefined) product[key] = updateData[key];
    }
    await product.save();

    return product.toObject();
};

export const deleteProductService = async ({ userId, productId }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw new AppError("Vendor profile not found", 404);
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (product.vendor.toString() !== vendor._id.toString()) {
        throw new AppError("Not authorised to delete this product", 403);
    }

    product.isActive = false;
    await product.save();

    return { message: "Product removed from listing" };
};

export const getMyProductsService = async ({ userId }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
        throw new AppError("Vendor profile not found", 404);
    }

    const products = await Product.find({ vendor: vendor._id })
        .populate("vendor", "storeName averageRating")
        .populate("category", "name slug")
        .lean();
    return products;
};