const OrderService = require("../services/OrderService");
const ApiResponse = require("../../../utils/ApiResponse");

const orderService = new OrderService();

class OrderController {
  async getBookingHistory(req, res) {
    if (!req.user) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    try {
      const result = await orderService.getBookingHistory(req.user.id);
      return ApiResponse.success(res, result, "Booking history fetched successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return ApiResponse.error(res, message, 500);
    }
  }
}

module.exports = OrderController;
