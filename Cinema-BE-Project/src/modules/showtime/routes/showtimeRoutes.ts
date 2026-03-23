import { Router } from "express";
import { showtimeController } from "../controllers/showtimeController";

const router = Router();

// GET /showtimes
router.get("/", showtimeController.getAll);
router.get("/nearest", showtimeController.getNearest);
router.get("/movies/:movieId", showtimeController.getByMovieId);

export default router;
