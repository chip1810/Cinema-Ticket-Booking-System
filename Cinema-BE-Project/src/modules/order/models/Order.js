// models/Order.js
const { Schema, model, Types } = require("mongoose");

// thay enum TS bằng object JS
const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const OrderSchema = new Schema(
  {
    UUID: {
      type: String,
      unique: true,
      default: () => new Types.ObjectId().toString(),
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    channel: {
      type: String,
      default: "ONLINE", // ONLINE | POS
    },

    voucher: {
      type: Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // giống CreateDateColumn
  }
);

const Order = model("Order", OrderSchema);

module.exports = { Order, OrderStatus };