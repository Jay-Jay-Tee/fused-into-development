import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            enum: ["bank_transfer", "razorpay"],
            required: true
        },
        transactionType: {
            type: String,
            enum: ["order", "refund", "payout"],
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
        // payment is either to/from a buyer or to a vendor or to delivery
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            required: true,
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);
paymentSchema.pre("validate", function (next) {

    const hasOrder = !!this.order;
    const hasRefund = !!this.refund;
    const hasPayout = this.transactionType === "payout";

    // both order and refund populated, or neither populated (but not payout)
    if ((hasOrder === hasRefund && hasOrder) || hasPayout )
        return next(
            new Error("Both excusive fields populated, only one of order/refund and vendor/buyer allowed")
        );
    if (this.transactionType === "order" && !this.order) {
        return next(
            new Error("Order payment must have an order reference")
        );
    }
    if (this.transactionType === "refund" && !this.refund) {
        return next(
            new Error("Refund payment must have a refund reference")
        );
    }

    next();
});

paymentSchema.index({ method: 1, transactionId: 1 }, { unique: true });

const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };