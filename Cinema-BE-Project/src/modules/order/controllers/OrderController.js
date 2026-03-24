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

  async getBookingDetail(req, res) {
  if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

  try {
    const result = await orderService.getBookingDetail(req.params.orderUUID, req.user.id);
    return ApiResponse.success(res, result, "Booking detail fetched successfully");
  } catch (error) {
    const msg = error?.message || "Internal Server Error";
    const code = msg === "Order not found" ? 404 : msg === "Forbidden" ? 403 : 500;
    return ApiResponse.error(res, msg, code);
  }
}
}

module.exports = OrderController;
