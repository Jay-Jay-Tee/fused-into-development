import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            enum: ["bank_transfer", "razorpay", "upi", "cashfree"],
            required: true
        },
        transactionType: {
            type: String,
            enum: ["order", "refund", "payout"],
            required: true
        },
        transactionId: {
            type: String
        },
        gatewayOrderId: {
            type: String
        },
        paymentSessionId: {
            type: String
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
            enum: ["pending", "paid", "failed", "pending_verification"],
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
    const hasTransactionId = !!this.transactionId;
    const hasGatewayOrderId = !!this.gatewayOrderId;
    const hasPaymentSessionId = !!this.paymentSessionId;
    const hasGatewayReference = hasGatewayOrderId || hasPaymentSessionId;

    if (hasOrder && hasRefund)
        return next(
            new Error("Payment cannot reference both an order and a refund")
        );

    if (hasPayout && (hasOrder || hasRefund))
        return next(
            new Error("Payout payment should not reference an order or refund")
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

    if (hasGatewayOrderId && hasPaymentSessionId) {
        return next(
            new Error("Payment cannot store both gatewayOrderId and paymentSessionId")
        );
    }

    if (this.transactionType !== "order" && hasGatewayReference) {
        return next(
            new Error("Only order payments can store gateway session details")
        );
    }

    if (hasGatewayOrderId && this.method !== "razorpay") {
        return next(
            new Error("gatewayOrderId is only valid for Razorpay order payments")
        );
    }

    if (hasPaymentSessionId && this.method !== "cashfree") {
        return next(
            new Error("paymentSessionId is only valid for Cashfree order payments")
        );
    }

    if (this.transactionType === "order" && hasTransactionId && hasGatewayReference) {
        return next(
            new Error("Order payment cannot store transactionId with gateway session details")
        );
    }

    if (
        this.transactionType === "order" &&
        this.status === "pending" &&
        this.method === "razorpay" &&
        !hasGatewayOrderId
    ) {
        return next(
            new Error("Pending Razorpay order payment must have gatewayOrderId")
        );
    }

    if (
        this.transactionType === "order" &&
        this.status === "pending" &&
        this.method === "cashfree" &&
        !hasPaymentSessionId
    ) {
        return next(
            new Error("Pending Cashfree order payment must have paymentSessionId")
        );
    }

    const requiresTransactionId =
        this.transactionType === "refund" ||
        this.transactionType === "payout" ||
        this.method === "upi" ||
        this.status === "pending_verification" ||
        (this.transactionType === "order" && this.status === "paid");

    if (requiresTransactionId && !hasTransactionId) {
        return next(
            new Error("Transaction ID is required for this payment state")
        );
    }

    next();
});

paymentSchema.index(
    { method: 1, transactionId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            transactionId: { $exists: true, $type: "string" }
        }
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };
