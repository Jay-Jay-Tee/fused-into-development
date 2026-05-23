import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    },
    {
        _id: false
    }
);

const wishlistSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [wishlistItemSchema]
    },
    {
        timestamps: true
    }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export { Wishlist };