const { Schema, model, Types } = require("mongoose");
const SeatType = require("../../seat/models/enums/SeatType");

const PricingRuleSchema = new Schema({
  showtime: { type: Types.ObjectId, ref: "Showtime", required: true },
  seatType: { type: String, enum: Object.values(SeatType), required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

PricingRuleSchema.index({ showtime: 1, seatType: 1 }, { unique: true });

module.exports = model("PricingRule", PricingRuleSchema);
