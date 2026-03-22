const { Router } = require("express");
const UserManagementController = require("../controllers/UserManagementController");
const StaffManagementController = require("../controllers/StaffManagementController");
const authenticate = require("../../../middlewares/authenticate.js");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = Router();

const userController = new UserManagementController();
const staffController = new StaffManagementController();

router.get(
  "/users",
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => userController.getAllCustomers(req, res)
);

router.patch(
  "/users/:id/block",
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => userController.blockUser(req, res)
);

router.post(
  "/staff",
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => staffController.createStaff(req, res)
);

router.get(
  "/staff",
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => staffController.getAllStaff(req, res)
);

module.exports = router;
