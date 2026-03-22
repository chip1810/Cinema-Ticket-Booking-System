// seatHold.model.js
const { Schema, model, Types } = require("mongoose");

const SeatHoldSchema = new Schema({
  showtime: { type: Types.ObjectId, ref: "Showtime", required: true },
  seat: { type: Types.ObjectId, ref: "Seat", required: true },
  user: { type: Types.ObjectId, ref: "User" }, // nullable
  expiresAt: { type: Date, required: true },
}, { timestamps: { createdAt: "createdAt" } });

// Unique constraint: prevent same seat in same showtime
SeatHoldSchema.index({ showtime: 1, seat: 1 }, { unique: true });
SeatHoldSchema.index({ showtime: 1 });
SeatHoldSchema.index({ expiresAt: 1 });

const SeatHold = model("SeatHold", SeatHoldSchema);

module.exports = SeatHold;