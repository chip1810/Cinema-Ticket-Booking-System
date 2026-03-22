// models/PricingRule.js
const { Schema, model, Types } = require("mongoose");
const SeatType = require("./enums/SeatType");
const mongoose = require("mongoose");

const PricingRuleSchema = new Schema(
  {
    UUID: {
      type: String,
      unique: true,
      default: () => new Types.ObjectId().toString(),
    },

    showtime: {
      type: Types.ObjectId,
      ref: "Showtime",
      required: true,
    },

    seatType: {
      type: String,
      enum: Object.values(SeatType),
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 unique giống @Unique(["showtime", "seatType"])
PricingRuleSchema.index(
  { showtime: 1, seatType: 1 },
  { unique: true }
);

const PricingRule = mongoose.models.PricingRule || mongoose.model('PricingRule', PricingRuleSchema);

module.exports = PricingRule;