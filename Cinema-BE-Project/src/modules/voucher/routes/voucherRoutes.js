const express = require("express");
const { VoucherController } = require("../controllers/VoucherController");
const authenticate = require("../../../middlewares/authenticate");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = express.Router();
const controller = new VoucherController();

// 🔐 ADMIN ONLY

// CREATE
router.post(
  "/",
  authenticate,
  authorize([UserRole.ADMIN]),
  controller.create.bind(controller)
);

// GET ALL
router.get(
  "/",
  authenticate,
  authorize([UserRole.ADMIN]),
  controller.findAll.bind(controller)
);

// APPLY VOUCHER (đặt trước :uuid để tránh conflict)
router.post(
  "/apply",
  authenticate,
  authorize([UserRole.CUSTOMER, UserRole.ADMIN]),
  controller.apply.bind(controller)
);

// GET BY UUID
router.get(
  "/:uuid",
  authenticate,
  authorize([UserRole.ADMIN]),
  controller.findByUUID.bind(controller)
);

// UPDATE
router.put(
  "/:uuid",
  authenticate,
  authorize([UserRole.ADMIN]),
  controller.update.bind(controller)
);

// DELETE
router.delete(
  "/:uuid",
  authenticate,
  authorize([UserRole.ADMIN]),
  controller.delete.bind(controller)
);

module.exports = router;