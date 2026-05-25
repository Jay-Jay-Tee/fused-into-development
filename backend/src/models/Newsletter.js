import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export { Newsletter };
