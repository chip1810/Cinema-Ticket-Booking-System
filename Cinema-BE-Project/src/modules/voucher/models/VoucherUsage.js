const { Schema, model, Types } = require("mongoose");

const VoucherUsageSchema = new Schema({
  voucher: { type: Types.ObjectId, ref: "Voucher", required: true },
  user: { type: Types.ObjectId, ref: "User", required: true },
  usedAt: { type: Date, default: Date.now },
}, { timestamps: false });

VoucherUsageSchema.index({ voucher: 1, user: 1 });
VoucherUsageSchema.index({ voucher: 1 });

module.exports = model("VoucherUsage", VoucherUsageSchema);
