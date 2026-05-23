import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        description: {
            type: String,
            maxlength: [1000, "Description too long"]
        },
        images: [
            {
                type: String
            }
        ],
        price: {
            type: Number,
            required: true,

        },
        stock: {
            type: Number,
            required: true,
            min: [0, "Stock cannot be negative"]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model("Product", productSchema);

export { Product };