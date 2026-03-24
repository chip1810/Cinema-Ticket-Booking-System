const ApiResponse = require("../../../utils/ApiResponse");
const CinemaBranchService = require("../../branch/services/CinemaBranchService");

const service = new CinemaBranchService();

class BranchManagementController {
  async createBranch(req, res) {
    try {
      const { name, address, hotline } = req.body || {};
      if (!name || !address || !hotline) {
        return ApiResponse.error(res, "name, address, hotline are required", 400);
      }

      const branch = await service.create({ name, address, hotline });
      return ApiResponse.success(res, branch, "Branch created successfully", 201);
    } catch (error) {
      if (error.message === "Branch name already exists") {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async getAllBranches(_req, res) {
    try {
      const branches = await service.findAll();
      return ApiResponse.success(res, branches, "Branches retrieved successfully", 200);
    } catch {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async updateBranch(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }

      const branch = await service.update(id, req.body || {});
      return ApiResponse.success(res, branch, "Branch updated successfully", 200);
    } catch (error) {
      if (error.message === "Branch not found") {
        return ApiResponse.error(res, error.message, 404);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async getBranchDetail(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return ApiResponse.error(res, "Invalid ID", 400);
      }
      const detail = await service.getDetail(id);
      return ApiResponse.success(res, detail, "Branch detail retrieved successfully", 200);
    } catch (error) {
      if (error.message === "Branch not found") {
        return ApiResponse.error(res, error.message, 404);
      }
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
}

module.exports = BranchManagementController;
