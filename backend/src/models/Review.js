import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor"
        },

        reviewType: {
            type: String,
            enum: ["product", "vendor"],
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);
reviewSchema.pre("validate", async function () {
    const hasProduct = !!this.product;
    const hasVendor = !!this.vendor;

    if (hasProduct === hasVendor)
        throw new AppError("Review must reference either product or vendor, but not both", 400);

    if (this.reviewType === "product" && !hasProduct)
        throw new AppError("Product review requires product field", 400);

    if (this.reviewType === "vendor" && !hasVendor)
        throw new AppError("Vendor review requires vendor field", 400);
});

reviewSchema.index({ reviewer: 1, product: 1, reviewType: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewer: 1, vendor: 1, reviewType: 1 }, { unique: true, sparse: true });

const Review = mongoose.model("Review", reviewSchema);

export { Review };