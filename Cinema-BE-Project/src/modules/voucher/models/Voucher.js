const { Schema, model, Types } = require("mongoose");
const VoucherType = require("./enums/VoucherType");

const VoucherSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  code: { type: String, unique: true, required: true },
  type: { type: String, enum: Object.values(VoucherType), required: true },
  value: { type: Number, required: true },
  minOrderValue: { type: Number },
  maxDiscountAmount: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  perUserLimit: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = model("Voucher", VoucherSchema);
