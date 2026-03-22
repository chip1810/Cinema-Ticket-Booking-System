const { Router } = require("express");
const OrderController = require("../controllers/OrderController");
const authenticate = require("../../../middlewares/authenticate.js");

const router = Router();
const controller = new OrderController();

router.get("/history", authenticate, controller.getBookingHistory.bind(controller));
router.get("/:orderUUID", authenticate, controller.getBookingDetail.bind(controller));

module.exports = router;
