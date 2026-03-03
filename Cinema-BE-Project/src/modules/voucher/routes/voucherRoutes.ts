import { Router } from "express";
import { VoucherController } from "../controllers/VoucherController";
import { authenticate } from "../../../middlewares/authenticate";
import { authorize } from "../../../middlewares/roleMiddlewares";
import { UserRole } from "../../auth/models/User";

const router = Router();
const controller = new VoucherController();
// 🔐 ADMIN ONLY

// CREATE
router.post("/", authenticate, authorize([UserRole.ADMIN]), controller.create.bind(controller));

// GET ALL
router.get("/", authenticate, authorize([UserRole.ADMIN]), controller.findAll.bind(controller));

// APPLY VOUCHER (để trên :uuid tránh conflict)
router.post("/apply", authenticate, authorize([UserRole.CUSTOMER, UserRole.ADMIN]), controller.apply.bind(controller));

// GET BY UUID
router.get("/:uuid", authenticate, authorize([UserRole.ADMIN]), controller.findByUUID.bind(controller));

// UPDATE
router.put("/:uuid", authenticate, authorize([UserRole.ADMIN]), controller.update.bind(controller));

// DELETE
router.delete("/:uuid", authenticate, authorize([UserRole.ADMIN]), controller.delete.bind(controller));

export default router;
