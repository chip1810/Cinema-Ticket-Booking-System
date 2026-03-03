import { Router } from "express";
import { SeatController } from "../controllers/SeatController";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();
const controller = new SeatController();

router.post("/hold", authenticate, controller.holdSeats);
router.post("/confirm", authenticate, controller.confirmBooking);

export default router;