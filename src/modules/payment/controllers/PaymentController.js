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
        console.log("🔥🔥 WEBHOOK HIT 🔥🔥");
        console.log("👉 BODY:", req.body);

        try {
            const result = await paymentService.handlePayOSWebhook(req.body);

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("❌ WEBHOOK ERROR:", error.message);

            return res.status(200).json({
                success: false,
                message: error.message
            });
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


    async cancel(req, res) {
        if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

        const { orderCode } = req.params;

        try {
            const result = await paymentService.cancelByUser(orderCode, req.user.id);
            return ApiResponse.success(res, result, "Payment cancelled");
        } catch (error) {
            return ApiResponse.error(res, error.message || "Cancel failed", 400);
        }
    }

    async mockSuccessRedirect(req, res) {
        try {
            if (process.env.PAYOS_ENABLE_DEV_REDIRECT_MOCK !== "true") {
                return ApiResponse.error(res, "Mock redirect is disabled", 403);
            }

            const key = req.query.key;
            if (!process.env.DEV_MOCK_KEY || key !== process.env.DEV_MOCK_KEY) {
                return ApiResponse.error(res, "Invalid mock key", 403);
            }

            const { orderCode } = req.params;
            const result = await paymentService.mockSuccessRedirect(orderCode);

            return res.redirect(302, result.redirectUrl);
        } catch (error) {
            return ApiResponse.error(res, error.message || "Mock redirect failed", 400);
        }
    }
}

module.exports = PaymentController;