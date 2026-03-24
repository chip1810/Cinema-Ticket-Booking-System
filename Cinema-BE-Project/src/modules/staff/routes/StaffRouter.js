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

router.get(
    "/orders/:orderId",
    authenticate,
    authorize([UserRole.STAFF]),
    (req, res) => controller.lookupOrder(req, res)
);

// staff.routes.js
router.get(
  "/profile",
  authenticate, // middleware giải mã JWT, gắn user vào req.user
  authorize([UserRole.STAFF]), // chỉ staff mới được xem
  (req, res) => controller.getProfile(req, res)
);

router.get(
  "/orders/by-uuid/:orderUUID",
  authenticate,
  authorize([UserRole.STAFF]),
  (req, res) => controller.lookupOrderDetailByUUID(req, res)
);

module.exports = router;