const { Schema, model, Types } = require("mongoose");

const HallSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  type: { type: String },
  showtimes: [{ type: Types.ObjectId, ref: "Showtime" }],
  seats: [{ type: Types.ObjectId, ref: "Seat" }],
}, { timestamps: true });

module.exports = model("Hall", HallSchema);
