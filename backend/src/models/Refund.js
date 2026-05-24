import mongoose from "mongoose";
import { orderItemSchema } from "./Order.js";

const refundSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        item: {
            type: orderItemSchema,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            maxlength: [1000, "Reason too long"]
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        refundAmount: {
            type: Number,
            required: true
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        resolvedAt: Date
    },
    {
        timestamps: true
    }
);

const Refund = mongoose.model("Refund", refundSchema);

export { Refund };