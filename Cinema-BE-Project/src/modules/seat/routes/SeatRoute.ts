import { Router } from "express";
import { SeatController } from "../controllers/SeatController";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();
const controller = new SeatController();

router.post("/hold", authenticate, controller.holdSeats);
router.post("/checkout/preview", authenticate, controller.checkoutPreview.bind(controller));
router.post("/confirm", authenticate, controller.confirmBooking);
router.get("/showtimes/showtimeUuid/:showtimeUUID/seats", controller.getSeatsByShowtime);

export default router;