// SeatController.js
const SeatService = require("../services/SeatService");
const ApiResponse = require("../../../utils/ApiResponse");

const seatService = new SeatService();

class SeatController {

  // 🎟 HOLD SEATS
  async holdSeats(req, res) {
    const { showtimeUUID, seatUUIDs } = req.body;

    if (!showtimeUUID || !Array.isArray(seatUUIDs) || seatUUIDs.length === 0) {
      return ApiResponse.error(res, "Invalid input", 400);
    }

    if (!req.user) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    try {
      const result = await seatService.holdSeats(
        showtimeUUID,
        seatUUIDs,
        req.user.id
      );

      return ApiResponse.success(res, result, "Seats held successfully");

    } catch (error) {
      return ApiResponse.error(res, error.message || "Error", 400);
    }
  }

  // 🛒 CHECKOUT PREVIEW
  async checkoutPreview(req, res) {
    const {
      showtimeUUID,
      seatUUIDs,
      concessions,
      voucherUUID,
      voucherCode
    } = req.body;

    if (!showtimeUUID || !Array.isArray(seatUUIDs) || seatUUIDs.length === 0) {
      return ApiResponse.error(res, "Invalid input", 400);
    }

    if (!req.user) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    try {
      const result = await seatService.checkoutPreview(
        showtimeUUID,
        seatUUIDs,
        concessions || [],
        req.user.id,
        voucherUUID,
        voucherCode
      );

      return ApiResponse.success(res, result, "Checkout preview calculated");

    } catch (error) {
      return ApiResponse.error(res, error.message || "Error", 400);
    }
  }

  // ✅ CONFIRM BOOKING
  async confirmBooking(req, res) {
    const { checkoutToken } = req.body;

    if (!checkoutToken) {
      return ApiResponse.error(res, "checkoutToken is required", 400);
    }

    if (!req.user) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    try {
      const result = await seatService.confirmBooking(
        checkoutToken,
        req.user.id
      );

      return ApiResponse.success(res, result, "Booking confirmed");

    } catch (error) {
      return ApiResponse.error(res, error.message || "Error", 400);
    }
  }

  // 📋 GET SEATS BY SHOWTIME
  async getSeatsByShowtime(req, res) {
    try {
      const showtimeUUID = req.params.showtimeUUID;

      if (!showtimeUUID || typeof showtimeUUID !== "string") {
        return ApiResponse.error(res, "Invalid showtimeUUID", 400);
      }

      const seats = await seatService.getSeatsByShowtime(showtimeUUID.trim());

      return ApiResponse.success(res, seats, "Seats fetched successfully");

    } catch (error) {
      const message = error.message || "Internal Server Error";
      const statusCode = message.includes("not found") ? 404 : 500;
      return ApiResponse.error(res, message, statusCode);
    }
  }
}

module.exports = SeatController;