const Order = require("../modules/order/models/Order").Order;
const Ticket = require("../modules/ticket/models/Ticket");
const ApiResponse = require("../utils/ApiResponse");

const ok = (res, data, msg) => ApiResponse.success(res, data, msg);
const fail = (res, e) => ApiResponse.error(res, e.message ?? e, 500);

class DashboardController {
  async getSummary(_req, res) {
    try {
      const revenueAgg = await Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]);

      const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
      const totalOrders = await Order.countDocuments();
      const totalTickets = await Ticket.countDocuments();

      return ok(res, {
        revenue: Number(totalRevenue) || 0,
        orders: Number(totalOrders) || 0,
        tickets: Number(totalTickets) || 0,
      }, "Dashboard summary fetched");
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
            as: "showtime",
          },
        },
        { $unwind: "$showtime" },
        {
          $lookup: {
            from: "movies",
            localField: "showtime.movie",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $group: {
            _id: "$movie._id",
            movieId: { $first: "$movie.UUID" },
            movieTitle: { $first: "$movie.title" },
            totalTickets: { $sum: 1 },
            totalRevenue: { $sum: "$price" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      const formatted = stats.map((s) => ({
        movieId: s.movieId,
        title: s.movieTitle,
        tickets: Number(s.totalTickets),
        revenue: Number(s.totalRevenue),
      }));

      return ok(res, formatted, "Movie statistics fetched");
    } catch (e) {
      return fail(res, e);
    }
  }
}

module.exports = DashboardController;
