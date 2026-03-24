import { Router } from "express";
import { ConcessionController } from "../controllers/ConcessionController";
import { authenticate } from "../../../middlewares/authenticate";
import { authorize } from "../../../middlewares/roleMiddlewares";
import { UserRole } from "../../auth/models/User";

const router = Router();
const controller = new ConcessionController();

// GET /api/concessions
router.get("/", controller.getAll.bind(controller));

// GET /api/concessions/:id
router.get("/:id", controller.getById.bind(controller));

router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.patch("/:id/stock", controller.updateStock.bind(controller));
router.delete("/:id", controller.delete.bind(controller));


export default router;