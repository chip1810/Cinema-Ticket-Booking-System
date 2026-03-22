// staff.service.js
const { User, UserRole } = require("../../auth/models/User");
const { Order } = require("../../order/models/Order");
const OrderItem = require("../../order_item/models/OrderItem");
const Ticket = require("../../ticket/models/Ticket");
class StaffService {
  async lookupCustomerByPhone(phoneNumber) {
    try {
      console.log("Searching customer with phone:", phoneNumber);

      const customer = await User.findOne({
        phoneNumber,
        role: UserRole.CUSTOMER,
      }).lean();

      if (!customer) {
        console.log("Customer not found");
        throw new Error("Customer not found");
      }

      console.log("Customer found:", customer._id);

      const { password, resetPasswordOTP, resetPasswordExpires, ...safeCustomer } = customer;

      const orders = await Order.find({ user: customer._id }).lean();
      console.log("Orders found:", orders.length);

      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await OrderItem.find({ order: order._id }).lean();
          const tickets = await Ticket.find({ order: order._id }).lean();

          console.log(`Order ${order._id}: items ${orderItems.length}, tickets ${tickets.length}`);

          return {
            ...order,
            orderItems,
            tickets,
          };
        })
      );

      return {
        ...safeCustomer,
        orders: ordersWithDetails,
      };

    } catch (err) {
      console.error("lookupCustomerByPhone ERROR:", err);
      throw err;
    }
  }

  async lookupOrderById(orderId) {
    // 1️⃣ Tìm Order và thông tin User + Voucher (nếu có)
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('voucher', 'code discountAmount')
      .lean();

    if (!order) return { order: null };

    // 2️⃣ Tìm OrderItem (Bắp nước) - Giả sử model này ref tới 'Concession'
    // Nếu model OrderItem của bạn dùng ref khác, hãy đổi tên 'concession' cho đúng
    const orderItems = await OrderItem.find({ order: order._id })
      .populate('concession', 'name price type')
      .lean();

    // 3️⃣ Tìm Ticket và lấy toàn bộ "phả hệ" dữ liệu
    const tickets = await Ticket.find({ order: order._id })
      .populate({
        path: 'seat',
        select: 'seatNumber type' // Lấy số ghế (A1) và loại ghế (VIP/NORMAL)
      })
      .populate({
        path: 'showtime',
        populate: [
          {
            path: 'movie',
            select: 'title posterUrl duration' // Lấy thông tin phim
          },
          {
            path: 'hall',
            select: 'name' // Lấy tên phòng chiếu
          }
        ]
      })
      .lean();

    return { order, orderItems, tickets };
  }

  async getStaffProfileById(staffId) {
    const staff = await User.findOne({
      _id: staffId,
      role: UserRole.STAFF
    }).lean();

    if (!staff) return null;

    // Loại bỏ dữ liệu nhạy cảm
    const { password, resetPasswordOTP, resetPasswordExpires, ...safeStaff } = staff;

    return safeStaff;
  }

  async lookupOrderDetailByUUID(orderUUID) {
    const order = await Order.findOne({ UUID: orderUUID })
      .populate("voucher")
      .lean();
    if (!order) return null;
    const tickets = await Ticket.find({ order: order._id })
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "UUID title posterUrl duration" },
          { path: "hall", select: "name" },
        ],
      })
      .populate("seat", "seatNumber type")
      .lean();
    const items = await OrderItem.find({ order: order._id })
      .populate("concession", "name")
      .lean();
    return {
      orderUUID: order.UUID,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      channel: order.channel,
      createdAt: order.createdAt,
      voucherCode: order.voucher?.code ?? null,
      tickets: tickets.map((t) => ({
        ticketUUID: t.UUID,
        seatNumber: t.seat?.seatNumber,
        seatType: t.seat?.type,
        price: Number(t.price || 0),
        showtime: {
          UUID: t.showtime?.UUID,
          startTime: t.showtime?.startTime,
          endTime: t.showtime?.endTime,
          movie: t.showtime?.movie
            ? {
              UUID: t.showtime.movie.UUID,
              title: t.showtime.movie.title,
              posterUrl: t.showtime.movie.posterUrl,
              duration: t.showtime.movie.duration,
            }
            : null,
          hall: t.showtime?.hall ? { name: t.showtime.hall.name } : null,
        },
      })),
      items: items.map((i) => ({
        concessionName: i.concession?.name,
        quantity: i.quantity,
        price: Number(i.price || 0),
        subtotal: Number(i.price || 0) * Number(i.quantity || 0),
      })),
    };
  }
}

module.exports = StaffService;