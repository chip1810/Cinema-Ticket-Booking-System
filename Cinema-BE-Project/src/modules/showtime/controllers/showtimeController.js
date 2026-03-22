const showtimeService = require("../services/showtimeService");
const { ApiResponse } = require("../../../utils/ApiResponse");

const showtimeController = {

  // 📋 GET ALL SHOWTIMES
  async getAll(req, res) {
    try {
      const showtimes = await showtimeService.getAllShowtimes();

      return ApiResponse.success(
        res,
        showtimes,
        "Showtimes fetched successfully"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";

      return ApiResponse.error(res, message, 500);
    }
  },

  // 🎬 GET SHOWTIME BY MOVIE ID
  async getByMovieId(req, res) {
    try {
      const movieId = req.params.movieId;

      if (!movieId) {
        return ApiResponse.error(res, "Invalid movieId", 400);
      }

      const showtimes =
        await showtimeService.getShowtimesByMovieId(movieId);

      return ApiResponse.success(
        res,
        showtimes,
        "Showtimes fetched successfully"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";

      return ApiResponse.error(res, message, 500);
    }
  },

  // ⏰ GET NEAREST SHOWTIMES
  async getNearest(req, res) {
    try {
      const showtimes = await showtimeService.getNearestShowtimes();

      return ApiResponse.success(
        res,
        showtimes,
        "Nearest showtimes fetched successfully"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";

      return ApiResponse.error(res, message, 500);
    }
  },
};

module.exports = { showtimeController };