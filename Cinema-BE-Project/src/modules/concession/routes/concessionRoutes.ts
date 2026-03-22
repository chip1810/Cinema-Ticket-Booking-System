import { Router } from "express";
import { ConcessionController } from "../controllers/ConcessionController";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/roleMiddlewares";
import { UserRole } from "../../auth/models/User";

const router = Router();
const controller = new ConcessionController();

// GET /api/concessions
router.get("/", controller.getAll.bind(controller));

// GET /api/concessions/:id
router.get("/:id", controller.getById.bind(controller));

router.post("/", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.create.bind(controller));
router.put("/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.update.bind(controller));
router.patch("/:id/stock", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.updateStock.bind(controller));
router.delete("/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), controller.delete.bind(controller));


export default router;