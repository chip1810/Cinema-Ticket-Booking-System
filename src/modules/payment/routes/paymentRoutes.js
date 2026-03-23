const { Router } = require("express");
const PaymentController = require("../controllers/PaymentController");
const authenticate = require("../../../middlewares/authenticate");

const router = Router();
const controller = new PaymentController();

// FE gọi sau khi có checkoutToken từ /api/seat/checkout/preview
router.post("/payos/create-link", authenticate, controller.createPayOSLink.bind(controller));

// payOS gọi webhook endpoint này
router.post("/payos/webhook", controller.payOSWebhook.bind(controller));

// FE poll/check trạng thái thanh toán theo orderCode
router.get("/payos/:orderCode", authenticate, controller.getStatus.bind(controller));

// FE gọi khi user hủy thanh toán trong vòng 10 phút giữ ghế
router.post("/payos/:orderCode/cancel", authenticate, controller.cancel.bind(controller));
// Mock endpoint để test redirect sau khi thanh toán thành công (chỉ trả HTML đơn giản, không xử lý logic gì)
router.get("/payos/mock-success/:orderCode/redirect", controller.mockSuccessRedirect.bind(controller));

module.exports = router;