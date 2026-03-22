const { Schema, model, Types } = require("mongoose");
const OrderStatus = require("./enums/OrderStatus");

const OrderSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  user: { type: Types.ObjectId, ref: "User" },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  totalAmount: { type: Number, required: true },
  channel: { type: String, default: "ONLINE" },
  voucher: { type: Types.ObjectId, ref: "Voucher" },
}, { timestamps: true });

const Order = model("Order", OrderSchema);

module.exports = { Order, OrderStatus };
