// models/Seat.model.js
const { Schema, model, Types } = require("mongoose");
const SeatType = require("./enums/SeatType");

const SeatSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  seatNumber: { type: String, required: true },
  row: { type: Number },
  col: { type: Number },
  type: { type: String, enum: Object.values(SeatType), default: SeatType.NORMAL },
  hall: { type: Types.ObjectId, ref: "Hall", required: true },
}, { timestamps: true });

// Unique index: seatNumber + hall
SeatSchema.index({ hall: 1, seatNumber: 1 }, { unique: true });
SeatSchema.index({ hall: 1 });

const Seat = model("Seat", SeatSchema);

module.exports = { Seat, SeatType };
