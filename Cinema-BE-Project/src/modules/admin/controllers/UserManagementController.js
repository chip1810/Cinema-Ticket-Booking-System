const { ApiResponse } = require("../../../utils/ApiResponse");
const { UserManagementService } = require("../services/UserManagementService");

const service = new UserManagementService();

class UserManagementController {

  // 📋 GET ALL CUSTOMERS
  async getAllCustomers(req, res) {
    try {
      const users = await service.getAllCustomers();

      return ApiResponse.success(res, users, "Customers retrieved", 200);

    } catch (error) {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  // 🔒 BLOCK USER
  async blockUser(req, res) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }

      const user = await service.blockUser(id);

      return ApiResponse.success(res, user, "User blocked successfully", 200);

    } catch (error) {

      if (error.message === "User not found") {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
}

module.exports = { UserManagementController };