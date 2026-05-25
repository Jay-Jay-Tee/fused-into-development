import { Cart }    from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/appError.js";


// creates an empty cart document on first access
export const getCartService = async ({ userId }) => {
    let cart = await Cart.findOne({ buyer: userId })
        .populate("items.product", "name images price stock isActive vendor")
        .lean();

    if (!cart) {
        return { buyer: userId, items: [], totalItems: 0, subtotal: 0 };
    }

    // filter out any items whose product has since been deactivated or deleted
    const activeItems = cart.items.filter(item => item.product?.isActive);

    const subtotal = activeItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return {
        ...cart,
        items:      activeItems,
        totalItems: activeItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal:   Number.parseFloat(subtotal.toFixed(2)),
    };
};


export const addToCartService = async ({ userId, productId, quantity }) => {
    const product = await Product.findById(productId);

    if (!product?.isActive)
        throw new AppError("Product not found or is no longer available", 404);

    // Stock check against the requested quantity - not cumulative with what's already in the cart.
    // The final stock guard happens at order creation; this is a soft check for UX.
    if (product.stock < quantity)
        throw new AppError(`Only ${product.stock} units available`, 400);

    let cart = await Cart.findOne({ buyer: userId });

    if (!cart) {
        cart = await Cart.create({
            buyer: userId,
            items: [{ product: productId, quantity }],
        });
    } else {
        const existingItem = cart.items.find(
            item => item.product.toString() === productId.toString()
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (product.stock < newQuantity)
                throw new AppError(`Only ${product.stock} units available`, 400);

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
    }

    return cart.populate("items.product", "name images price stock isActive");
};

export const updateCartItemService = async ({ userId, productId, quantity }) => {
    if (quantity < 1)
        throw new AppError("Quantity must be at least 1. Use remove to delete an item.", 400);

    const product = await Product.findById(productId);

    if (!product?.isActive)
        throw new AppError("Product not found or is no longer available", 404);

    if (product.stock < quantity)
        throw new AppError(`Only ${product.stock} units available`, 400);

    const cart = await Cart.findOne({ buyer: userId });

    if (!cart)
        throw new AppError("Cart not found", 404);

    const item = cart.items.find(
        i => i.product.toString() === productId.toString()
    );

    if (!item)
        throw new AppError("Item not found in cart", 404);

    item.quantity = quantity;
    await cart.save();

    return cart.populate("items.product", "name images price stock isActive");
};

// removes a single product from the cart entirely
export const removeCartItemService = async ({ userId, productId }) => {
    const cart = await Cart.findOne({ buyer: userId });

    if (!cart)
        throw new AppError("Cart not found", 404);

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
        item => item.product.toString() !== productId.toString()
    );

    if (cart.items.length === initialLength)
        throw new AppError("Item not found in cart", 404);

    await cart.save();
    return cart.populate("items.product", "name images price stock isActive");
};

export const clearCartService = async ({ userId }) => {
    const cart = await Cart.findOne({ buyer: userId });

    if (!cart)
        throw new AppError("Cart not found", 404);

    cart.items = [];
    await cart.save();

    return { message: "Cart cleared" };
};