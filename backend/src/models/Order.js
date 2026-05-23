import mongoose from "mongoose";
import addressSchema from "./Address.js";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        image: {
            type: String
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [orderItemSchema],

        shippingAddress: addressSchema,

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment"
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        },

        subtotal: {
            type: Number,
            required: true
        },

        deliveryFee: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        deliveredAt: Date
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

export { orderItemSchema, Order };