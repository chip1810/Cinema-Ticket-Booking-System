import { Router } from "express";
import { UserManagementController } from "../controllers/UserManagementController";
import { StaffManagementController } from "../controllers/StaffManagementController";
import { authenticate } from "../../../middlewares/authenticate";
import { authorize } from "../../../middlewares/roleMiddlewares";
import { UserRole } from "../../auth/models/User";

const router = Router();

const userController = new UserManagementController();
const staffController = new StaffManagementController();

// Manage Users
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

// Manage Staff
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

export default router;