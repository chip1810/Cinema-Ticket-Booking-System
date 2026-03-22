const { Schema, model, Types } = require("mongoose");

const TicketSchema = new Schema({
  UUID: {
    type: String,
    required: true,
    unique: true,
    default: () => new Types.ObjectId().toString(),
  },
  showtime: { type: Types.ObjectId, ref: "Showtime", required: true },
  seat: { type: Types.ObjectId, ref: "Seat", required: true },
  order: { type: Types.ObjectId, ref: "Order", required: true },
  user: { type: Types.ObjectId, ref: "User", required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

TicketSchema.index({ showtime: 1, seat: 1 }, { unique: true });

module.exports = model("Ticket", TicketSchema);
