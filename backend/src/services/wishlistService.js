import { Wishlist } from "../models/Wishlist.js";
import { Product }  from "../models/Product.js";
import { AppError } from "../utils/appError.js";



export const getWishlistService = async ({ userId }) => {
    let wishlist = await Wishlist.findOne({ buyer: userId })
        .populate("items.product", "name images price averageRating totalReviews isActive vendor")
        .lean();

    if (!wishlist) {
        return { buyer: userId, items: [] };
    }

    // Strip out items where the product has since been deleted or deactivated.
    const activeItems = wishlist.items.filter(item => item.product?.isActive);

    return { ...wishlist, items: activeItems };
};

// does not add duplicates
export const addToWishlistService = async ({ userId, productId }) => {
    const product = await Product.findById(productId);

    if (!product?.isActive)
        throw new AppError("Product not found or is no longer available", 404);

    let wishlist = await Wishlist.findOne({ buyer: userId });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            buyer: userId,
            items: [{ product: productId }],
        });
    } else {
        const alreadyAdded = wishlist.items.some(
            item => item.product.toString() === productId.toString()
        );

        if (!alreadyAdded) {
            wishlist.items.push({ product: productId });
            await wishlist.save();
        }
    }

    return await wishlist.populate("items.product", "name images price averageRating totalReviews isActive");
};

// removes a single product from the wishlist
export const removeFromWishlistService = async ({ userId, productId }) => {
    const wishlist = await Wishlist.findOne({ buyer: userId });

    if (!wishlist)
        throw new AppError("Wishlist not found", 404);

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
        item => item.product.toString() !== productId.toString()
    );

    if (wishlist.items.length === initialLength)
        throw new AppError("Product not found in wishlist", 404);

    await wishlist.save();
    return await wishlist.populate("items.product", "name images price averageRating totalReviews isActive");
};