const { Schema, model, Types } = require("mongoose");

const PaymentStatus = {
    PENDING: "PENDING",
    PAID: "PAID",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
};

const PaymentTransactionSchema = new Schema(
    {
        UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
        provider: { type: String, default: "PAYOS" },

        user: { type: Types.ObjectId, ref: "User", required: true },
        checkoutToken: { type: String, required: true },

        orderCode: { type: Number, unique: true, required: true },
        paymentLinkId: { type: String, default: null },
        checkoutUrl: { type: String, default: null },

        amount: { type: Number, required: true },
        currency: { type: String, default: "VND" },

        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },

        orderUUID: { type: String, default: null },
        failReason: { type: String, default: null },

        expiresAt: { type: Date, default: null },
        paidAt: { type: Date, default: null },

        rawWebhook: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
);

PaymentTransactionSchema.index({ user: 1, createdAt: -1 });
PaymentTransactionSchema.index({ checkoutToken: 1 });

const PaymentTransaction = model("PaymentTransaction", PaymentTransactionSchema);

module.exports = { PaymentTransaction, PaymentStatus };