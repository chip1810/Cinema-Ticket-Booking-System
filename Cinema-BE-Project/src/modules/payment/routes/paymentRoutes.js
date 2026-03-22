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

module.exports = router;