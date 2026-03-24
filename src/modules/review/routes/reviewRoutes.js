const { Router } = require("express");
const ReviewController = require("../controllers/ReviewController");
const authenticate = require("../../../middlewares/authenticate");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = Router();
const controller = new ReviewController();

/**
 * Public
 */
router.get("/movie/:movieUUID", controller.getByMovie.bind(controller));

/**
 * Customer review flow
 */
router.get(
  "/movie/:movieUUID/eligibility",
  authenticate,
  authorize([UserRole.CUSTOMER]),
  controller.getEligibility.bind(controller)
);

router.post(
  "/movie/:movieUUID",
  authenticate,
  authorize([UserRole.CUSTOMER]),
  controller.create.bind(controller)
);

/**
 * Manager/Admin moderation
 * (khớp managerService hiện tại: GET /reviews, PATCH /reviews/:id/moderate, DELETE /reviews/:id)
 */
router.get(
  "/",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.listForModeration.bind(controller)
);

router.patch(
  "/:id/moderate",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.moderate.bind(controller)
);

router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.delete.bind(controller)
);

module.exports = router;