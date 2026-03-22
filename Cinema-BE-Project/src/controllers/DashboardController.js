const Order = require("../modules/order/models/Order");
const Ticket = require("../modules/ticket/models/Ticket");
const { ApiResponse } = require("../utils/ApiResponse");

const ok = (res, data, msg) =>
  ApiResponse.success(res, data, msg);

const fail = (res, e) =>
  ApiResponse.error(res, e.message || e, 500);

class DashboardController {

  // ================= SUMMARY =================
  async getSummary(req, res) {
    try {
      // 💰 Tổng doanh thu
      const revenueResult = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" }
          }
        }
      ]);

      // 📦 Tổng đơn hàng
      const totalOrders = await Order.countDocuments();

      // 🎟 Tổng vé
      const totalTickets = await Ticket.countDocuments();

      return ok(res, {
        revenue: revenueResult[0]?.totalRevenue || 0,
        orders: totalOrders,
        tickets: totalTickets
      }, "Dashboard summary fetched");

    } catch (e) {
      return fail(res, e);
    }
  }

  // ================= MOVIE STATS =================
  async getMovieStats(req, res) {
    try {
      const stats = await Ticket.aggregate([

        // join showtime
        {
          $lookup: {
            from: "showtimes",
            localField: "showtime",
            foreignField: "_id",
            as: "showtime"
          }
        },
        { $unwind: "$showtime" },

        // join movie
        {
          $lookup: {
            from: "movies",
            localField: "showtime.movie",
            foreignField: "_id",
            as: "movie"
          }
        },
        { $unwind: "$movie" },

        // group theo movie
        {
          $group: {
            _id: "$movie._id",
            movieTitle: { $first: "$movie.title" },
            totalTickets: { $sum: 1 },
            totalRevenue: { $sum: "$price" }
          }
        },

        // sort giảm dần theo revenue
        {
          $sort: { totalRevenue: -1 }
        }
      ]);

      const formatted = stats.map(s => ({
        movieId: s._id,
        title: s.movieTitle,
        tickets: s.totalTickets,
        revenue: s.totalRevenue
      }));

      return ok(res, formatted, "Movie statistics fetched");

    } catch (e) {
      return fail(res, e);
    }
  }
}

module.exports = { DashboardController };