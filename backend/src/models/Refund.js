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
        },
        reason: {
            type: String,
            required: true,
            maxlength: [1000, "Reason too long"]
        },
        refundScope: {
            type: String,
            enum: ["item", "order"],
            default: "item",
            required: true
        },
        source: {
            type: String,
            enum: ["buyer", "system"],
            default: "buyer",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "processing", "rejected", "resolved"],
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
        adminNote: {
            type: String,
            default: null
        },
        gatewayRefundId: {
            type: String,
            default: null
        },
        resolvedAt: Date
    },
    {
        timestamps: true
    }
);

refundSchema.pre("validate", async function () {
    if (this.refundScope === "item" && !this.item)
        throw new Error("Item refund must include the refunded order item");

    if (this.refundScope === "order" && this.item)
        throw new Error("Order refund cannot include an item payload");
});

const Refund = mongoose.model("Refund", refundSchema);

export { Refund };
