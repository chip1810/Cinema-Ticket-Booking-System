const { ApiResponse } = require("../../../utils/ApiResponse");
const { StaffManagementService } = require("../services/StaffManagementService");

const service = new StaffManagementService();

class StaffManagementController {

  // 🆕 CREATE STAFF
  async createStaff(req, res) {
    try {
      const staff = await service.createStaff(req.body);

      return ApiResponse.success(res, staff, "Staff created successfully", 201);

    } catch (error) {

      if (error.message === "Email already exists") {
        return ApiResponse.error(res, error.message, 400);
      }

      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  // 📋 GET ALL STAFF
  async getAllStaff(req, res) {
    try {
      const staff = await service.getAllStaff();

      return ApiResponse.success(res, staff, "Staff retrieved successfully", 200);

    } catch (error) {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
}

module.exports = { StaffManagementController };