import { Router } from "express";
import { UserManagementController } from "../controllers/UserManagementController";
import { StaffManagementController } from "../controllers/StaffManagementController";
import { BranchManagementController } from "../controllers/BranchManagementController";
import { ReportController } from "../controllers/ReportController";
import { ExportController } from "../controllers/ExportController";
import { SystemSettingsController } from "../controllers/SystemSettingsController";
import { authenticate } from "../../../middlewares/authenticate";
import { authorize } from "../../../middlewares/roleMiddlewares";
import { UserRole } from "../../auth/models/User";

const router = Router();

const userController = new UserManagementController();
const staffController = new StaffManagementController();
const branchController = new BranchManagementController();
const reportController = new ReportController();
const exportController = new ExportController();
const systemSettingsController = new SystemSettingsController();

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

// Manage Cinema Branches
router.post(
    "/branches",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => branchController.createBranch(req, res)
);

router.get(
    "/branches",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => branchController.getAllBranches(req, res)
);

router.put(
    "/branches/:id",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => branchController.updateBranch(req, res)
);

// Dashboard & Reports
router.get(
    "/reports/movies",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => reportController.movieRevenue(req, res)
);

router.get(
    "/reports/cinemas",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => reportController.cinemaRevenue(req, res)
);

router.get(
    "/reports/customers/top",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => reportController.topCustomers(req, res)
);

// Export
router.get(
    "/export/reports/movies",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => exportController.exportMovieRevenue(req, res)
);

// System Settings
router.get(
    "/system-settings",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => systemSettingsController.getAll(req, res)
);

router.put(
    "/system-settings",
    authenticate,
    authorize([UserRole.ADMIN]),
    (req, res) => systemSettingsController.upsert(req, res)
);

export default router;