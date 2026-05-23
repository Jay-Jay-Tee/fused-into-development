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
        transactionType: {
            type: String,
            enum: ["incoming", "outgoing"],
            required: true
        },
        transactionId: {
            type: String,
            required: true
        },
        // payment is either for an order or a refund, but not both
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        refund: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Refund"
        },
        // payment is either from a buyer or to a vendor, but not both
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor"
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);
paymentSchema.pre("validate", function (next) {

    const hasOrder = !!this.order;
    const hasRefund = !!this.refund;
    const hasVendor = !!this.vendor;
    const hasBuyer = !!this.buyer;

    if (hasOrder === hasRefund || hasVendor === hasBuyer)
        return next(
            new Error("Both excusive fields populated, only one of order/refund and vendor/buyer allowed")
        );
    
    next();
});

paymentSchema.index({ method: 1, transactionId: 1 }, { unique: true });

const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };