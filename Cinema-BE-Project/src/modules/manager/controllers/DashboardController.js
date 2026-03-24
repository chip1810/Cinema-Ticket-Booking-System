const { Order, OrderStatus } = require("../../order/models/Order");
const Ticket = require("../../ticket/models/Ticket");
const Movie = require("../../movie/models/Movie");
const OrderItem = require("../../order_item/models/OrderItem");
const ApiResponse = require("../../../utils/ApiResponse");
const ExcelJS = require('exceljs');

const ok = (res, data, msg) => ApiResponse.success(res, data, msg);
const fail = (res, e) => ApiResponse.error(res, e.message ?? e, 500);

class DashboardController {
  async getSummary(_req, res) {
    try {
      // Get core counts - Match status in DB (PAID from OrderStatus)
      const totalRevenueAgg = await Order.aggregate([
        { $match: { status: OrderStatus.PAID } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      const totalRevenue = totalRevenueAgg[0]?.total || 0;
      const totalOrders = await Order.countDocuments();
      const totalTickets = await Ticket.countDocuments();
      const totalMovies = await Movie.countDocuments();

      // Recent Transactions with deep population
      const recentOrders = await Order.find()
        .populate("user", "fullName email")
        .populate("voucher", "code discountAmount")
        .sort({ createdAt: -1 })
        .limit(10);
      
      const orderIds = recentOrders.map(o => o._id);
      
      const tickets = await Ticket.find({ order: { $in: orderIds } })
        .populate({ path: "showtime", populate: ["movie", "hall"] })
        .populate("seat");

      const items = await OrderItem.find({ order: { $in: orderIds } })
        .populate("concession");

      const transactions = recentOrders.map(o => {
        const orderTickets = tickets.filter(t => String(t.order) === String(o._id));
        const orderItems = items.filter(it => String(it.order) === String(o._id));

        return {
          id: o._id,
          UUID: o.UUID,
          name: o.user?.fullName || 'Guest Customer',
          email: o.user?.email || 'N/A',
          amount: o.totalAmount,
          status: o.status,
          date: o.createdAt,
          voucher: o.voucher ? { code: o.voucher.code, discount: o.voucher.discountAmount } : null,
          details: {
            tickets: orderTickets.map(t => ({
              movie: t.showtime?.movie?.title,
              hall: t.showtime?.hall?.name,
              seat: t.seat?.seatNumber,
              price: t.price
            })),
            concessions: orderItems.map(it => ({
              name: it.concession?.name,
              quantity: it.quantity,
              price: it.price
            }))
          }
        };
      });

      const stats = [
        { title: 'Total Revenue', value: totalRevenue, change: 12.5, icon: 'DollarSign', color: 'green', isCurrency: true },
        { title: 'Total Tickets', value: totalTickets, change: 8.2, icon: 'Ticket', color: 'red', isCurrency: false },
        { title: 'New Orders', value: totalOrders, change: 5.4, icon: 'TrendingUp', color: 'amber', isCurrency: false },
        { title: 'Movies Playing', value: totalMovies, change: 0, icon: 'Users', color: 'blue', isCurrency: false },
      ];

      const revenueChart = [450000, 520000, 480000, 610000, 550000, 670000, (totalRevenue % 500000) + 400000];

      return ok(res, { stats, transactions, revenueChart }, "Dashboard summary fetched");
    } catch (e) {
      console.error(e);
      return fail(res, e);
    }
  }

  async exportSummary(_req, res) {
    try {
      console.log('DEBUG: Starting exportSummary...');
      const orders = await Order.find({ status: OrderStatus.PAID })
        .populate("user", "fullName")
        .sort({ createdAt: -1 });
      
      console.log(`DEBUG: Found ${orders.length} PAID orders to export.`);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Sales Report');

      sheet.columns = [
        { header: 'Order UUID', key: 'uuid', width: 35 },
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total Amount (VND)', key: 'amount', width: 20 },
        { header: 'Channel', key: 'channel', width: 15 },
        { header: 'Date', key: 'date', width: 25 },
      ];

      orders.forEach(o => {
        sheet.addRow({
          uuid: o.UUID,
          customer: o.user?.fullName || 'Guest',
          status: o.status,
          amount: o.totalAmount,
          channel: o.channel,
          date: o.createdAt.toLocaleString()
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Cinema_Report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (e) {
      return fail(res, e);
    }
  }

  async getMovieStats(_req, res) {
    try {
      const stats = await Ticket.aggregate([
        {
          $lookup: {
            from: "showtimes",
            localField: "showtime",
            foreignField: "_id",
            as: "st",
          },
        },
        { $unwind: "$st" },
        {
          $lookup: {
            from: "movies",
            localField: "st.movie",
            foreignField: "_id",
            as: "m",
          },
        },
        { $unwind: "$m" },
        {
          $group: {
            _id: "$m._id",
            name: { $first: "$m.title" },
            sales: { $sum: 1 },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 10 }
      ]);

      const maxSales = stats[0]?.sales || 1;
      const popularMovies = stats.map(s => ({
        name: s.name,
        sales: s.sales,
        progress: (s.sales / maxSales) * 100
      }));

      return ok(res, { popularMovies }, "Movie statistics fetched");
    } catch (e) {
      return fail(res, e);
    }
  }
}

module.exports = DashboardController;
