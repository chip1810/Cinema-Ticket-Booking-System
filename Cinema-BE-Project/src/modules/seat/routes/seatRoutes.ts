import { Router } from "express";
import { SeatController } from "../controllers/SeatController";

const router = Router();

router.get("/halls/:hallId/seats", SeatController.getSeatsByHallId);

export default router;
