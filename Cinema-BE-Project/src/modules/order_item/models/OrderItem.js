const { Schema, model, Types } = require("mongoose");

const OrderItemSchema = new Schema(
  {
    order: {
      type: Types.ObjectId,
      ref: "Order",
      required: true,
    },

    concession: {
      type: Types.ObjectId,
      ref: "Concession",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true, // snapshot price
    },
  },
  { timestamps: true }
);

const OrderItem = model("OrderItem", OrderItemSchema);

module.exports = OrderItem;