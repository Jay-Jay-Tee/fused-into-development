import {
    getProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService,
    getMyProductsService
} from "../services/productService.js";
import { Vendor } from "../models/Vendor.js";
import { AppError } from "../utils/appError.js";

const getProducts = async (req, res) => {
    const data = await getProductsService(req.query);
    return res.status(200).json(data);
};

const getProductById = async (req, res) => {
    const data = await getProductByIdService({ productId: req.params.id });
    return res.status(200).json(data);
};

// sets req.uploadFolder so CloudinaryStorage knows where to put files
// vendor/[vendorId]/productImages has all images for that vendor
const resolveProductFolder = async (req, res, next) => {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) throw new AppError("Vendor profile not found", 404);
    if (!vendor.isApproved) throw new AppError("Vendor account is not approved yet", 403);

    req.resolvedVendor = vendor;
    req.uploadFolder = `vendor/${vendor._id}/productImages`;
    next();
};

const createProduct = async (req, res) => {
    const images = req.files ? req.files.map(f => f.path) : [];
    const data = await createProductService({
        vendor: req.resolvedVendor,
        productData: { ...req.body, images },
    });
    return res.status(201).json(data);
};

const updateProduct = async (req, res) => {
    const images = req.files && req.files.length > 0
        ? req.files.map(f => f.path)
        : undefined;

    const data = await updateProductService({
        vendor: req.resolvedVendor,
        productId: req.params.id,
        updateData: { ...req.body, ...(images && { images }) },
    });
    return res.status(200).json(data);
};

const deleteProduct = async (req, res) => {
    const data = await deleteProductService({
        userId: req.user.id,
        productId: req.params.id,
    });
    return res.status(200).json(data);
};

const getMyProducts = async (req, res) => {
    const data = await getMyProductsService({ userId: req.user.id });
    return res.status(200).json(data);
};

export const productController = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
    resolveProductFolder,
};