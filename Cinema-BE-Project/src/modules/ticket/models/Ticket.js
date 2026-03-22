import { Schema, model, Types } from "mongoose";

// Schema cho ticket
const ticketSchema = new Schema({
  UUID: {
    type: String,
    required: true,
    unique: true,
    default: () => new Types.ObjectId().toString(), // tạo UUID tự động
  },
  showtime: {
    type: Types.ObjectId,
    ref: "Showtime",
    required: true,
  },
  seat: {
    type: Types.ObjectId,
    ref: "Seat",
    required: true,
  },
  order: {
    type: Types.ObjectId,
    ref: "Order",
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔹 Index để đảm bảo 1 ghế / showtime chỉ có 1 ticket (unique)
ticketSchema.index({ showtime: 1, seat: 1 }, { unique: true });

export const Ticket = model("Ticket", ticketSchema);