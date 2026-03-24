const showtimeService = require("../services/showtimeService");
const ShowtimeService = require("../../../services/ShowtimeService");
const showtimeManager = new ShowtimeService();
const ApiResponse = require("../../../utils/ApiResponse");

class ShowtimeController {
  async getAll(req, res) {
    try {
      const showtimes = await showtimeService.getAllShowtimes(req.query);
      return ApiResponse.success(res, showtimes, "Showtimes fetched successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return ApiResponse.error(res, message, 500);
    }
  }

  async getByMovieId(req, res) {
    try {
      const movieId = req.params.movieId;
      if (!movieId) return ApiResponse.error(res, "Invalid movieId", 400);

      const showtimes = await showtimeService.getShowtimesByMovieId(movieId);
      return ApiResponse.success(res, showtimes, "Showtimes fetched successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return ApiResponse.error(res, message, 500);
    }
  }

  async getById(req, res) {
    try {
      const item = await showtimeManager.getShowtimeById(req.params.id);
      return ApiResponse.success(res, item, "Showtime fetched");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async create(req, res) {
    try {
      const item = await showtimeManager.createShowtime(req.body);
      return ApiResponse.success(res, item, "Showtime created", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async update(req, res) {
    try {
      const item = await showtimeManager.updateShowtime(req.params.id, req.body);
      return ApiResponse.success(res, item, "Showtime updated");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async delete(req, res) {
    try {
      await showtimeManager.deleteShowtime(req.params.id);
      return ApiResponse.success(res, null, "Showtime deleted");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async getNearest(_req, res) {
    try {
      const showtimes = await showtimeService.getNearestShowtimes();
      return ApiResponse.success(res, showtimes, "Nearest showtimes fetched successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return ApiResponse.error(res, message, 500);
    }
  }
}

module.exports = ShowtimeController;
