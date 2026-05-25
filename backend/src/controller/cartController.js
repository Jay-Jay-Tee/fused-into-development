import {
    getCartService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService,
} from "../services/cartService.js";

const getCart = async (req, res) => {
    const data = await getCartService({ userId: req.user.id });
    return res.status(200).json(data);
};

const addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const data = await addToCartService({ userId: req.user.id, productId, quantity });
    return res.status(200).json(data);
};

const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const data = await updateCartItemService({
        userId:    req.user.id,
        productId: req.params.productId,
        quantity,
    });
    return res.status(200).json(data);
};

const removeCartItem = async (req, res) => {
    const data = await removeCartItemService({
        userId:    req.user.id,
        productId: req.params.productId,
    });
    return res.status(200).json(data);
};

const clearCart = async (req, res) => {
    const data = await clearCartService({ userId: req.user.id });
    return res.status(200).json(data);
};

export const cartController = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};