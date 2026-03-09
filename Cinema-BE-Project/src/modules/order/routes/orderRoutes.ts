import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authenticate } from "../../../middlewares/authenticate";

const router = Router();
const controller = new OrderController();

router.get("/history", authenticate, controller.getBookingHistory.bind(controller));

export default router;