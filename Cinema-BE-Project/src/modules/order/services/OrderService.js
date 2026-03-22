const Order = require("../models/Order");

class OrderService {

  async getBookingHistory(userId) {

    const orders = await Order.find({ user: userId })
      .populate({
        path: "tickets",
        populate: [
          {
            path: "showtime",
            populate: [
              { path: "movie" },
              { path: "hall" }
            ]
          },
          { path: "seat" }
        ]
      })
      .populate({
        path: "items",
        populate: { path: "concession" }
      })
      .populate("voucher")
      .sort({ createdAt: -1 });

    return orders.map((order) => ({
      orderUUID: order.UUID,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      channel: order.channel,
      createdAt: order.createdAt,
      voucherCode: order.voucher?.code || null,

      // 🎟 TICKETS
      tickets: (order.tickets || []).map((t) => ({
        ticketUUID: t.UUID,
        seatNumber: t.seat?.seatNumber,
        seatType: t.seat?.type,
        price: Number(t.price),

        showtime: {
          UUID: t.showtime?.UUID,
          startTime: t.showtime?.startTime,
          endTime: t.showtime?.endTime,

          movie: {
            UUID: t.showtime?.movie?.UUID,
            title: t.showtime?.movie?.title,
            duration: t.showtime?.movie?.duration,
            posterUrl: t.showtime?.movie?.posterUrl,
          },

          hall: {
            name: t.showtime?.hall?.name,
          }
        }
      })),

      // 🍿 CONCESSION ITEMS
      items: (order.items || []).map((item) => ({
        concessionName: item.concession?.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: item.quantity * Number(item.price),
      }))
    }));
  }
}

module.exports = { OrderService };