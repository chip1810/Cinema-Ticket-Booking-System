const ShowtimeController = require("../controllers/ShowtimeController"); 
const controller = new ShowtimeController();
const router = require("express").Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/movies/:movieId", (req, res) => controller.getByMovieId(req, res));
router.get("/nearest", (req, res) => controller.getNearest(req, res));

module.exports = router;