// showtime.routes.js
const Router = require("express").Router;
const showtimeController = require("../controllers/showtimeController");

const router = Router();

// GET /showtimes
router.get("/", showtimeController.getAll);
router.get("/movies/:movieId", showtimeController.getByMovieId);
router.get("/nearest", showtimeController.getNearest);

module.exports = router;