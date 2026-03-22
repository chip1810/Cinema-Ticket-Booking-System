const { Router } = require("express");
const UserManagementController = require("../controllers/UserManagementController");
const StaffManagementController = require("../controllers/StaffManagementController");
const BranchManagementController = require("../controllers/BranchManagementController");
const ReportController = require("../controllers/ReportController");
const ExportController = require("../controllers/ExportController");
const SystemSettingsController = require("../controllers/SystemSettingsController");
const authenticate = require("../../../middlewares/authenticate");
const authorize = require("../../../middlewares/roleMiddlewares");
const { UserRole } = require("../../auth/models/User");

const router = Router();

const userController = new UserManagementController();
const staffController = new StaffManagementController();
const branchController = new BranchManagementController();
const reportController = new ReportController();
const exportController = new ExportController();
const systemSettingsController = new SystemSettingsController();

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

router.get(
  "/export/reports/movies",
  authenticate,
  authorize([UserRole.ADMIN]),
  (req, res) => exportController.exportMovieRevenue(req, res)
);

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

module.exports = router;
