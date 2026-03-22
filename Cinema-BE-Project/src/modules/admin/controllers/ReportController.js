const ApiResponse = require("../../../utils/ApiResponse");
const Ticket = require("../../ticket/models/Ticket");
const OrderModel = require("../../order/models/Order");

const Order = OrderModel.Order || OrderModel;

class ReportController {
  async movieRevenue(_req, res) {
    try {
      const stats = await Ticket.aggregate([
        { $lookup: { from: "showtimes", localField: "showtime", foreignField: "_id", as: "showtime" } },
        { $unwind: "$showtime" },
        { $lookup: { from: "movies", localField: "showtime.movie", foreignField: "_id", as: "movie" } },
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

      return ApiResponse.success(res, formatted, "Movie revenue report fetched", 200);
    } catch (error) {
      return ApiResponse.error(res, error.message ?? "Internal Server Error", 500);
    }
  }

  async cinemaRevenue(_req, res) {
    try {
      const stats = await Ticket.aggregate([
        { $lookup: { from: "showtimes", localField: "showtime", foreignField: "_id", as: "showtime" } },
        { $unwind: "$showtime" },
        { $lookup: { from: "halls", localField: "showtime.hall", foreignField: "_id", as: "hall" } },
        { $unwind: "$hall" },
        { $lookup: { from: "cinemabranches", localField: "hall.branch", foreignField: "_id", as: "branch" } },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$branch._id", "unknown"] },
            branchId: { $first: { $ifNull: ["$branch.UUID", "Unknown"] } },
            branchName: { $first: { $ifNull: ["$branch.name", "Unknown"] } },
            totalTickets: { $sum: 1 },
            totalRevenue: { $sum: "$price" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      const formatted = stats.map((s) => ({
        branchId: s.branchId,
        branchName: s.branchName,
        tickets: Number(s.totalTickets),
        revenue: Number(s.totalRevenue),
      }));

      return ApiResponse.success(res, formatted, "Cinema revenue report fetched", 200);
    } catch (error) {
      return ApiResponse.error(res, error.message ?? "Internal Server Error", 500);
    }
  }

  async topCustomers(req, res) {
    try {
      const limit = Number(req.query.limit) || 10;

      const stats = await Order.aggregate([
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$user._id",
            userId: { $first: "$user.UUID" },
            fullName: { $first: "$user.fullName" },
            email: { $first: "$user.email" },
            phoneNumber: { $first: "$user.phoneNumber" },
            totalSpent: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: limit },
      ]);

      const formatted = stats.map((s) => ({
        userId: s.userId,
        fullName: s.fullName,
        email: s.email,
        phoneNumber: s.phoneNumber,
        totalSpent: Number(s.totalSpent),
        totalOrders: Number(s.totalOrders),
      }));

      return ApiResponse.success(res, formatted, "Top customers fetched", 200);
    } catch (error) {
      return ApiResponse.error(res, error.message ?? "Internal Server Error", 500);
    }
  }
}

module.exports = ReportController;
