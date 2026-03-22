// seat.routes.js
const Router = require("express").Router;
const SeatController = require("../controllers/SeatController");
const authenticate = require("../../../middlewares/authenticate");

const router = Router();
const controller = new SeatController();

router.post("/hold", authenticate, controller.holdSeats.bind(controller));
router.post("/checkout/preview", authenticate, controller.checkoutPreview.bind(controller));
router.post("/confirm", authenticate, controller.confirmBooking.bind(controller));
router.get(
  "/showtimes/showtimeUuid/:showtimeUUID/seats",
  controller.getSeatsByShowtime.bind(controller)
);

module.exports = router;