const express = require("express");
const { ConcessionController } = require("../controllers/ConcessionController");
const { authenticate } = require("../../../middlewares/authenticate");
const { authorize } = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = express.Router();
const controller = new ConcessionController();

// GET /api/concessions
router.get("/", controller.getAll.bind(controller));

// GET /api/concessions/:id
router.get("/:id", controller.getById.bind(controller));

// CREATE
router.post(
  "/",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.create.bind(controller)
);

// UPDATE
router.put(
  "/:id",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.update.bind(controller)
);

// UPDATE STOCK
router.patch(
  "/:id/stock",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.updateStock.bind(controller)
);

// DELETE
router.delete(
  "/:id",
  authenticate,
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  controller.delete.bind(controller)
);

module.exports = router;