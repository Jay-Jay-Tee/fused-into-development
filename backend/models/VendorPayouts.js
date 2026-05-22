import mongoose from "mongoose";

const monthlyPayoutSchema = new mongoose.Schema(
    {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        year: {
            type: Number,
            required: true,
        },

        totalRevenue: {
            type: Number,
            default: 0
        },

        commissionDeducted: {
            type: Number,
            default: 0
        },

        finalPayout: {
            type: Number,
            default: 0
        },

        totalOrders: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["pending", "processed"],
            default: "pending"
        },

        paidAt: {
            type: Date
        },

        paymentinfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true
        }
    },
    {
        _id: false
    }
);

const vendorPayoutSchema = new mongoose.Schema(
    {
        payouts: [monthlyPayoutSchema]
    },
    {
        timestamps: true
    }
);

const VendorPayout = mongoose.model("VendorPayout",vendorPayoutSchema);

export default VendorPayout;