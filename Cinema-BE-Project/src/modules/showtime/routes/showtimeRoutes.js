const Router = require("express").Router;
const showtimeController = require("../controllers/showtimeController"); // 🔹 KHÔNG destructuring

const router = Router();

router.get("/", showtimeController.getAll);
router.get("/movies/:movieId", showtimeController.getByMovieId);
router.get("/nearest", showtimeController.getNearest);

module.exports = router;