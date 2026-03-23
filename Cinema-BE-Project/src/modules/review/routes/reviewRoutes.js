const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");
const authenticate = require("../../../middlewares/authenticate");

const reviewController = new ReviewController();

router.get("/movie/:uuid", (req, res) => reviewController.getByMovie(req, res));
router.get("/", (req, res) => reviewController.getAll(req, res));
router.post("/", authenticate, (req, res) => reviewController.create(req, res));
router.patch("/:id/moderate", (req, res) =>
  reviewController.moderate(req, res)
);
router.delete("/:id", (req, res) => reviewController.delete(req, res));

module.exports = router;
