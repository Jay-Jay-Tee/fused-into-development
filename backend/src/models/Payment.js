import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            enum: ["bank_transfer", "paypal", "stripe", "razorpay"],
            required: true
        },
        transactionId: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({ method: 1, transactionId: 1 }, { unique: true });

const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };