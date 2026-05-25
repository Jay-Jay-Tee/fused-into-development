import {
    getProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService,
    getMyProductsService
} from "../services/productService.js";

const getProducts = async (req, res) => {
    const data = await getProductsService(req.query);
    return res.status(200).json(data);
};

const getProductById = async (req, res) => {
    const data = await getProductByIdService({ productId: req.params.id });
    return res.status(200).json(data);
};

const createProduct = async (req, res) => {
    const images = req.files
        ? Object.values(req.files).flat().map(f => f.path)
        : [];
    const data = await createProductService({
        userId: req.user.id,
        productData: { ...req.body, images },
    });
    return res.status(201).json(data);
};

const updateProduct = async (req, res) => {
    const data = await updateProductService({
        userId: req.user.id,
        productId: req.params.id,
        updateData: req.body,
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
}

export const productController = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts
};
