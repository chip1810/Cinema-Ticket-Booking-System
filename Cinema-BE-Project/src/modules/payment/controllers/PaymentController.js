const ApiResponse = require("../../../utils/ApiResponse");
const PaymentService = require("../services/PaymentService");

const paymentService = new PaymentService();

class PaymentController {
  async createPayOSLink(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    const { checkoutToken } = req.body || {};
    if (!checkoutToken) return ApiResponse.error(res, "checkoutToken is required", 400);

    try {
      const result = await paymentService.createPayOSPaymentLink(checkoutToken, req.user.id);
      return ApiResponse.success(res, result, "PayOS payment link created");
    } catch (error) {
      return ApiResponse.error(res, error.message || "Create payment link failed", 400);
    }
  }

  async payOSWebhook(req, res) {
    try {
      const result = await paymentService.handlePayOSWebhook(req.body);
      // webhook nên trả 2xx để payOS xác nhận đã nhận
      return ApiResponse.success(res, result, "Webhook processed");
    } catch (error) {
      return ApiResponse.error(res, error.message || "Invalid webhook", 400);
    }
  }

  async getStatus(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    const { orderCode } = req.params;
    if (!orderCode) return ApiResponse.error(res, "orderCode is required", 400);

    try {
      const result = await paymentService.getPaymentStatus(orderCode, req.user.id);
      return ApiResponse.success(res, result, "Payment status fetched");
    } catch (error) {
      return ApiResponse.error(res, error.message || "Cannot get payment status", 404);
    }
  }
}

module.exports = PaymentController;