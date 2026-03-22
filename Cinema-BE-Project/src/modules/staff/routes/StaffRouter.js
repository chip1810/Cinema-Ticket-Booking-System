// staff.routes.js
const Router = require("express").Router;
const StaffController = require("../controllers/StaffController");
const authenticate = require("../../../middlewares/authenticate");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = Router();
const controller = new StaffController();

router.get(
  "/customers/:phoneNumber",
  authenticate,
  authorize([UserRole.STAFF]),
  (req, res) => controller.lookupCustomer(req, res)
);

module.exports = router;