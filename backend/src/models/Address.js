import mongoose from "mongoose";

export const addressSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName:  { type: String, required: true },
        street:    { type: String, required: true },
        city:      { type: String, required: true },
        state:     { type: String, required: true },
        country:   { type: String, required: true },
        pincode:   { type: String, required: true },
        phone:     { type: String, required: true },
    },
    { _id: false }
);