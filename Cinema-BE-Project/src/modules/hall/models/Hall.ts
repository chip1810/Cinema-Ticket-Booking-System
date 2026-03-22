import { Schema, model, Types } from "mongoose";

const HallSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  type: { type: String },
  showtimes: [{ type: Types.ObjectId, ref: "Showtime" }], // OneToMany relation
  seats: [{ type: Types.ObjectId, ref: "Seat" }],         // OneToMany relation
}, { timestamps: true });

export const Hall = model("Hall", HallSchema);