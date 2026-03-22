const mongoose = require("mongoose");
const { Order } = require("../models/Order");
const Ticket = require("../../ticket/models/Ticket");
const OrderItem = require("../../order_item/models/OrderItem");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

class OrderService {
  async getBookingHistory(userId) {
    if (!isObjectId(userId)) throw new Error("Invalid user");
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const orders = await Order.find({ user: userObjectId })
      .populate("voucher")
      .sort({ createdAt: -1 });

    const orderIds = orders.map((o) => o._id);

    const tickets = await Ticket.find({ order: { $in: orderIds } })
      .populate({ path: "showtime", populate: ["movie", "hall"] })
      .populate("seat");

    const items = await OrderItem.find({ order: { $in: orderIds } })
      .populate("concession");

    const ticketsByOrder = new Map();
    for (const t of tickets) {
      const key = String(t.order);
      if (!ticketsByOrder.has(key)) ticketsByOrder.set(key, []);
      ticketsByOrder.get(key).push(t);
    }

    const itemsByOrder = new Map();
    for (const it of items) {
      const key = String(it.order);
      if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
      itemsByOrder.get(key).push(it);
    }

    return orders.map((order) => {
      const orderTickets = ticketsByOrder.get(String(order._id)) || [];
      const orderItems = itemsByOrder.get(String(order._id)) || [];

      return {
        orderUUID: order.UUID,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        channel: order.channel,
        createdAt: order.createdAt,
        voucherCode: order.voucher?.code ?? null,
        tickets: orderTickets.map((t) => ({
          ticketUUID: t.UUID,
          seatNumber: t.seat?.seatNumber,
          seatType: t.seat?.type,
          price: Number(t.price),
          showtime: {
            UUID: t.showtime?.UUID,
            startTime: t.showtime?.startTime,
            endTime: t.showtime?.endTime,
            movie: t.showtime?.movie
              ? {
                  UUID: t.showtime.movie.UUID,
                  title: t.showtime.movie.title,
                  duration: t.showtime.movie.duration,
                  posterUrl: t.showtime.movie.posterUrl,
                }
              : null,
            hall: t.showtime?.hall
              ? {
                  name: t.showtime.hall.name,
                }
              : null,
          },
        })),
        items: orderItems.map((item) => ({
          concessionName: item.concession?.name,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: item.quantity * Number(item.price),
        })),
      };
    });
  }
}

module.exports = OrderService;
