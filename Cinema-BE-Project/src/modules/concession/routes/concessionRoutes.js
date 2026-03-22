const { Router } = require("express");
const ConcessionController = require("../controllers/ConcessionController");
const authenticate = require("../../../middlewares/authenticate.js");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = Router();
const controller = new ConcessionController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.post("/", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.create.bind(controller));
router.put("/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.update.bind(controller));
router.patch("/:id/stock", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.updateStock.bind(controller));
router.delete("/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.delete.bind(controller));

module.exports = router;
