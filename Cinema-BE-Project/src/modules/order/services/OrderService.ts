import { AppDataSource } from "../../../data-source";
import { Order } from "../models/Order";

export class OrderService {
  async getBookingHistory(userId: number) {
    const orderRepo = AppDataSource.getRepository(Order);

    const orders = await orderRepo.find({
      where: { user: { id: userId } },
      relations: ["tickets", "tickets.showtime", "tickets.showtime.movie", "tickets.showtime.hall", "tickets.seat", "items", "items.concession", "voucher"],
      order: { createdAt: "DESC" },
    });

    return orders.map((order) => ({
      orderUUID: order.UUID,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      channel: order.channel,
      createdAt: order.createdAt,
      voucherCode: order.voucher?.code ?? null,
      tickets: order.tickets?.map((t) => ({
        ticketUUID: t.UUID,
        seatNumber: t.seat.seatNumber,
        seatType: t.seat.type,
        price: Number(t.price),
        showtime: {
          UUID: t.showtime.UUID,
          startTime: t.showtime.startTime,
          endTime: t.showtime.endTime,
          movie: {
            UUID: t.showtime.movie.UUID,
            title: t.showtime.movie.title,
            duration: t.showtime.movie.duration,
            posterUrl: t.showtime.movie.posterUrl,
          },
          hall: {
            name: t.showtime.hall.name,
          },
        },
      })) ?? [],
      items: order.items?.map((item) => ({
        concessionName: item.concession.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: item.quantity * Number(item.price),
      })) ?? [],
    }));
  }
}