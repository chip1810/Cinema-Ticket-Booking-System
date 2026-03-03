import { Router } from "express";
import { StaffController } from "../controllers/StaffController";
import { authenticate } from "../../../middlewares/authenticate";
import { authorize } from "../../../middlewares/roleMiddlewares";
import { UserRole } from "../../auth/models/User";

const router = Router();
const controller = new StaffController();

router.get(
    "/customers/:phoneNumber",
    authenticate,
    authorize([UserRole.STAFF]),
    (req, res) => controller.lookupCustomer(req, res)
);

export default router;