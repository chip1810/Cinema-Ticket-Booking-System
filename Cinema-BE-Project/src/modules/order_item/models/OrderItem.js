const { Schema, model, Types } = require("mongoose");

const OrderItemSchema = new Schema({
  order: { type: Types.ObjectId, ref: "Order", required: true },
  concession: { type: Types.ObjectId, ref: "Concession", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = model("OrderItem", OrderItemSchema);
