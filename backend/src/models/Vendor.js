import mongoose from "mongoose";
import { addressSchema } from "./Address.js";

const vendorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        storeName: {
            type: String,
            required: [true, "Store name is required"],
            trim: true
        },

        storeDescription: {
            type: String,
            maxlength: [500, "Description too long"]
        },

        logo: {
            type: String
        },

        bannerImage: {
            type: String
        },

        phone: {
            type: String
        },

        addresses: [addressSchema],

        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            }
        ],

        isApproved: {
            type: Boolean,
            default: false
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        },
        commission: {
            type: Number,
            default: 10,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export { Vendor };