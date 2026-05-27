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
paymentSchema.pre("validate", async function () {
    const hasOrder = !!this.order;
    const hasRefund = !!this.refund;
    const hasPayout = this.transactionType === "payout";
    const hasTransactionId = !!this.transactionId;
    const hasGatewayOrderId = !!this.gatewayOrderId;
    const hasPaymentSessionId = !!this.paymentSessionId;
    const hasGatewayReference = hasGatewayOrderId || hasPaymentSessionId;

    if (hasOrder && hasRefund)
        throw new Error("Payment cannot reference both an order and a refund");

    if (hasPayout && (hasOrder || hasRefund))
        throw new Error("Payout payment should not reference an order or refund");

    if (this.transactionType === "order" && !this.order)
        throw new Error("Order payment must have an order reference");

    if (this.transactionType === "refund" && !this.refund)
        throw new Error("Refund payment must have a refund reference");

    if (hasGatewayOrderId && hasPaymentSessionId)
        throw new Error("Payment cannot store both gatewayOrderId and paymentSessionId");

    if (this.transactionType !== "order" && hasGatewayReference)
        throw new Error("Only order payments can store gateway session details");

    if (hasGatewayOrderId && this.method !== "razorpay")
        throw new Error("gatewayOrderId is only valid for Razorpay order payments");

    if (hasPaymentSessionId && this.method !== "cashfree")
        throw new Error("paymentSessionId is only valid for Cashfree order payments");

    if (this.transactionType === "order" && hasTransactionId && hasGatewayReference)
        throw new Error("Order payment cannot store transactionId with gateway session details");

    if (
        this.transactionType === "order" &&
        this.status === "pending" &&
        this.method === "razorpay" &&
        !hasGatewayOrderId
    ) {
        throw new Error("Pending Razorpay order payment must have gatewayOrderId");
    }

    if (
        this.transactionType === "order" &&
        this.status === "pending" &&
        this.method === "cashfree" &&
        !hasPaymentSessionId
    ) {
        throw new Error("Pending Cashfree order payment must have paymentSessionId");
    }

    const requiresTransactionId =
        this.transactionType === "refund" ||
        this.transactionType === "payout" ||
        this.method === "upi" ||
        this.status === "pending_verification" ||
        (this.transactionType === "order" && this.status === "paid");

    if (requiresTransactionId && !hasTransactionId)
        throw new Error("Transaction ID is required for this payment state");
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
