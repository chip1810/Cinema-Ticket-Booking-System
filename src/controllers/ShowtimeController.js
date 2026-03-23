const ShowtimeService = require("../services/ShowtimeService");
const ApiResponse = require("../utils/ApiResponse");

const showtimeService = new ShowtimeService();

class ShowtimeController {
  async create(req, res) {
    try {
      const { movieId, hallId, startTime } = req.body || {};
      if (!movieId || !hallId || !startTime) {
        return ApiResponse.error(res, "movieId, hallId and startTime are required", 400);
      }
      const showtime = await showtimeService.createShowtime({ movieId, hallId, startTime });
      return ApiResponse.success(res, showtime, "Showtime created successfully", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async getAll(_req, res) {
    try {
      return ApiResponse.success(res, await showtimeService.getAllShowtimes(), "Showtimes fetched successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const showtime = await showtimeService.getShowtimeById(req.params.id);
      return ApiResponse.success(res, showtime, "Showtime fetched successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async update(req, res) {
    try {
      const showtime = await showtimeService.updateShowtime(req.params.id, req.body || {});
      return ApiResponse.success(res, showtime, "Showtime updated successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async delete(req, res) {
    try {
      await showtimeService.deleteShowtime(req.params.id);
      return ApiResponse.success(res, null, "Showtime cancelled successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }
}

module.exports = ShowtimeController;
