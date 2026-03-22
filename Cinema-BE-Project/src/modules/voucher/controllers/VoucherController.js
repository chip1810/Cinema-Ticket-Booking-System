const VoucherService = require("../services/VoucherService");
const ApiResponse = require("../../../utils/ApiResponse");

const voucherService = new VoucherService();

class VoucherController {
  async create(req, res) {
    try {
      const dto = req.body || {};
      if (!dto.code || !dto.type || dto.value === undefined || !dto.startDate || !dto.endDate) {
        return ApiResponse.error(res, "Missing required fields", 400);
      }
      const result = await voucherService.create(dto);
      return ApiResponse.success(res, result, "Voucher created successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async findAll(_req, res) {
    try {
      const result = await voucherService.findAll();
      return ApiResponse.success(res, result, "Vouchers fetched successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async findByUUID(req, res) {
    try {
      const result = await voucherService.findByUUID(req.params.uuid);
      return ApiResponse.success(res, result, "Voucher fetched successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  async update(req, res) {
    try {
      const result = await voucherService.update(req.params.uuid, req.body || {});
      return ApiResponse.success(res, result, "Voucher updated successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      await voucherService.delete(req.params.uuid);
      return ApiResponse.success(res, null, "Voucher deleted successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  async apply(req, res) {
    const dto = req.body || {};

    if (!dto.voucherUUID && (!dto.code || typeof dto.code !== "string" || dto.code.trim() === "")) {
      return ApiResponse.error(res, "Can co voucherUUID hoac code", 400);
    }

    if (!req.user) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    try {
      const result = await voucherService.apply(dto, req.user.id);
      return ApiResponse.success(res, result, "Voucher applied successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = VoucherController;
