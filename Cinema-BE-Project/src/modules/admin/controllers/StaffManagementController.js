const ApiResponse = require("../../../utils/ApiResponse");
const StaffManagementService = require("../services/StaffManagementService");

const service = new StaffManagementService();

class StaffManagementController {
  async createStaff(req, res) {
    try {
      const { email, phoneNumber } = req.body || {};

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailPattern.test(email) || !email.endsWith("@gmail.com")) {
        return ApiResponse.error(res, "Email must be a valid gmail address (@gmail.com)", 400);
      }

      const phonePattern = /^0\d{9}$/;
      if (phoneNumber && (typeof phoneNumber !== "string" || !phonePattern.test(phoneNumber))) {
        return ApiResponse.error(res, "Phone number must be 10 digits and start with 0", 400);
      }

      const staff = await service.createStaff(req.body || {});
      return ApiResponse.success(res, staff, "Staff created successfully", 201);
    } catch (error) {
      if (error.message === "Email already exists") {
        return ApiResponse.error(res, error.message, 400);
      }
      if (
        error.message === "Branch not found" ||
        error.message.startsWith("Manager must") ||
        error.message.startsWith("This branch already has a manager")
      ) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async getAllStaff(req, res) {
    try {
      const branchId = req.query.branchId || req.query.branchUUID || null;
      const staff = await service.getAllStaff(branchId);
      return ApiResponse.success(res, staff, "Staff retrieved successfully", 200);
    } catch (error) {
      if (error.message === "Branch not found") {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async updateStaff(req, res) {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }
      const staff = await service.updateStaff(id, req.body || {});
      return ApiResponse.success(res, staff, "Cập nhật nhân viên thành công", 200);
    } catch (error) {
      if (error.message === "User not found") {
        return ApiResponse.error(res, error.message, 404);
      }
      if (error.message.startsWith("Chỉ áp dụng")) {
        return ApiResponse.error(res, error.message, 400);
      }
      if (
        error.message === "Email already exists" ||
        error.message === "Phone number already in use" ||
        error.message === "Branch not found" ||
        error.message.startsWith("Email must") ||
        error.message.startsWith("Phone number must") ||
        error.message.startsWith("Invalid role") ||
        error.message.startsWith("Manager must") ||
        error.message.startsWith("This branch already has a manager")
      ) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async deleteStaff(req, res) {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }
      const result = await service.deleteStaff(id);
      return ApiResponse.success(res, result, "Đã xóa tài khoản nhân viên", 200);
    } catch (error) {
      if (error.message === "User not found") {
        return ApiResponse.error(res, error.message, 404);
      }
      if (error.message.startsWith("Chỉ áp dụng")) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async blockStaff(req, res) {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }
      const user = await service.setStaffBlocked(id, true);
      return ApiResponse.success(res, user, "Đã khóa tài khoản nhân viên", 200);
    } catch (error) {
      if (error.message === "User not found") {
        return ApiResponse.error(res, error.message, 404);
      }
      if (error.message.startsWith("Chỉ áp dụng")) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async unblockStaff(req, res) {
    try {
      const id = req.params.id;
      if (!id || Array.isArray(id)) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }
      const user = await service.setStaffBlocked(id, false);
      return ApiResponse.success(res, user, "Đã mở khóa tài khoản nhân viên", 200);
    } catch (error) {
      if (error.message === "User not found") {
        return ApiResponse.error(res, error.message, 404);
      }
      if (error.message.startsWith("Chỉ áp dụng")) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
}

module.exports = StaffManagementController;
