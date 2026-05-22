import mongoose from "mongoose";

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
reviewSchema.pre("validate", function (next) {

    const hasProduct = !!this.product;
    const hasVendor = !!this.vendor;

    if (hasProduct === hasVendor)
        return next(
            new Error("Review must reference either product or vendor, but not both")
        );

    if (this.reviewType === "product" && !hasProduct)
        return next(
            new Error("Product review requires product field")
        );

    if (this.reviewType === "vendor" && !hasVendor)
        return next(
            new Error("Vendor review requires vendor field")
        );

    next();
});

const Review = mongoose.model("Review", reviewSchema);

export { Review };