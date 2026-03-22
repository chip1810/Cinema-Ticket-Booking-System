const ConcessionService = require("../services/ConcessionService");
const ApiResponse = require("../../../utils/ApiResponse");

const concessionService = new ConcessionService();

class ConcessionController {
  async getAll(_req, res) {
    try {
      const result = await concessionService.getAll();
      return ApiResponse.success(res, result, "Concessions fetched");
    } catch (e) {
      return ApiResponse.error(res, e.message ?? e, 500);
    }
  }

  async getById(req, res) {
    try {
      const result = await concessionService.getById(req.params.id);
      return ApiResponse.success(res, result, "Concession fetched");
    } catch (e) {
      return ApiResponse.error(res, e.message ?? e, 404);
    }
  }

  async create(req, res) {
    const { name, type, price, stockQuantity, imageUrl } = req.body || {};
    if (!name || !type || price === undefined) {
      return ApiResponse.error(res, "name, type and price are required", 400);
    }

    try {
      const result = await concessionService.create({
        name,
        type,
        price,
        stockQuantity,
        imageUrl,
      });
      return ApiResponse.success(res, result, "Concession created", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message ?? e, 500);
    }
  }

  async update(req, res) {
    try {
      const result = await concessionService.update(req.params.id, req.body || {});
      return ApiResponse.success(res, result, "Concession updated");
    } catch (e) {
      return ApiResponse.error(res, e.message ?? e, 404);
    }
  }

  async updateStock(req, res) {
    const qty = Number(req.body?.quantity);
    if (Number.isNaN(qty)) return ApiResponse.error(res, "quantity must be a number", 400);

    try {
      await concessionService.updateStock(req.params.id, qty);
      return ApiResponse.success(res, null, "Stock updated");
    } catch (e) {
      return ApiResponse.error(res, e.message ?? e, 404);
    }
  }

  async delete(req, res) {
    try {
      await concessionService.delete(req.params.id);
      return ApiResponse.success(res, null, "Concession deleted");
    } catch (e) {
      return ApiResponse.error(res, e.message ?? e, 404);
    }
  }
}

module.exports = ConcessionController;
