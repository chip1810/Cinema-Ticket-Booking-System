const { Router } = require("express");
const VoucherController = require("../controllers/VoucherController");
const authenticate = require("../../../middlewares/authenticate.js");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = Router();
const controller = new VoucherController();

router.post("/", authenticate, authorize([UserRole.ADMIN]), controller.create.bind(controller));
router.get("/", authenticate, authorize([UserRole.ADMIN]), controller.findAll.bind(controller));
router.post("/apply", authenticate, authorize([UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF]), controller.apply.bind(controller));
router.get("/:uuid", authenticate, authorize([UserRole.ADMIN]), controller.findByUUID.bind(controller));
router.put("/:uuid", authenticate, authorize([UserRole.ADMIN]), controller.update.bind(controller));
router.delete("/:uuid", authenticate, authorize([UserRole.ADMIN]), controller.delete.bind(controller));

module.exports = router;
