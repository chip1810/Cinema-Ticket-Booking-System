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
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async getAllStaff(_req, res) {
    try {
      const staff = await service.getAllStaff();
      return ApiResponse.success(res, staff, "Staff retrieved successfully", 200);
    } catch {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
}

module.exports = StaffManagementController;
