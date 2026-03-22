const { ApiResponse } = require("../../../utils/ApiResponse");
const { VoucherService } = require("../services/VoucherService");

const voucherService = new VoucherService();

class VoucherController {

  // ✅ CREATE
  async create(req, res) {
    try {
      const { code, discount, expiryDate } = req.body;

      if (!code || !discount || !expiryDate) {
        return ApiResponse.error(res, "Missing required fields", 400);
      }

      const result = await voucherService.create({
        code,
        discount,
        expiryDate
      });

      return ApiResponse.success(res, result, "Voucher created successfully");

    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // ✅ GET ALL
  async findAll(req, res) {
    try {
      const result = await voucherService.findAll();
      return ApiResponse.success(res, result, "Vouchers fetched successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // ✅ GET BY UUID
  async findByUUID(req, res) {
    try {
      const { uuid } = req.params;

      if (!uuid) {
        return ApiResponse.error(res, "UUID is required", 400);
      }

      const result = await voucherService.findByUUID(uuid);

      return ApiResponse.success(res, result, "Voucher fetched successfully");

    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  // ✅ UPDATE
  async update(req, res) {
    try {
      const { uuid } = req.params;

      if (!uuid) {
        return ApiResponse.error(res, "UUID is required", 400);
      }

      const result = await voucherService.update(uuid, req.body);

      return ApiResponse.success(res, result, "Voucher updated successfully");

    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // ✅ DELETE
  async delete(req, res) {
    try {
      const { uuid } = req.params;

      await voucherService.delete(uuid);

      return ApiResponse.success(res, null, "Voucher deleted successfully");

    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  // 🎟 APPLY
  async apply(req, res) {
    try {
      const { voucherUUID, code } = req.body;

      // validate input
      if (!voucherUUID && (!code || code.trim() === "")) {
        return ApiResponse.error(res, "Cần có voucherUUID hoặc code", 400);
      }

      // check login
      if (!req.user) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const result = await voucherService.apply(
        { voucherUUID, code },
        req.user._id // 🔥 Mongo dùng _id
      );

      return ApiResponse.success(res, result, "Voucher applied successfully");

    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = { VoucherController };