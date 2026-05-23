import mongoose from "mongoose";

const vendorPayoutSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
            unique: true
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        year: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "paid"]
        },
        paymentInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment"
        }
    },
    {
        timestamps: true
    }
);

vendorPayoutSchema.index({ vendor: 1, month: 1, year: 1 }, { unique: true });

const VendorPayout = mongoose.model("VendorPayout", vendorPayoutSchema);

export { VendorPayout };