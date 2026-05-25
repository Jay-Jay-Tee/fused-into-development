import {
    getWishlistService,
    addToWishlistService,
    removeFromWishlistService,
} from "../services/wishlistService.js";

const getWishlist = async (req, res) => {
    const data = await getWishlistService({ userId: req.user.id });
    return res.status(200).json(data);
};

const addToWishlist = async (req, res) => {
    const { productId } = req.body;
    const data = await addToWishlistService({ userId: req.user.id, productId });
    return res.status(200).json(data);
};

const removeFromWishlist = async (req, res) => {
    const data = await removeFromWishlistService({
        userId:    req.user.id,
        productId: req.params.productId,
    });
    return res.status(200).json(data);
};

export const wishlistController = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};