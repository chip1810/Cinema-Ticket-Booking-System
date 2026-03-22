// ConcessionController.js
const { ConcessionService } = require("../services/ConcessionService");
const { ApiResponse } = require("../../../utils/ApiResponse");

const concessionService = new ConcessionService();

class ConcessionController {

    // GET /api/concessions
    async getAll(req, res) {
        try {
            const result = await concessionService.getAll();
            return ApiResponse.success(res, result, "Concessions fetched");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 500);
        }
    }

    // GET /api/concessions/:id
    async getById(req, res) {
        try {
            const id = req.params.id;
            const result = await concessionService.getById(id);
            return ApiResponse.success(res, result, "Concession fetched");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

    // POST /api/concessions
    async create(req, res) {
        try {
            const dto = req.body;
            // Nếu muốn, có thể validate dto bằng Joi hoặc express-validator
            const result = await concessionService.create(dto);
            return ApiResponse.success(res, result, "Concession created", 201);
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 500);
        }
    }

    // PUT /api/concessions/:id
    async update(req, res) {
        try {
            const id = req.params.id;
            const result = await concessionService.update(id, req.body);
            return ApiResponse.success(res, result, "Concession updated");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

    // PATCH /api/concessions/:id/stock
    async updateStock(req, res) {
        try {
            const id = req.params.id;
            const quantity = Number(req.body.quantity);
            if (isNaN(quantity)) return ApiResponse.error(res, "quantity must be a number", 400);

            await concessionService.updateStock(id, quantity);
            return ApiResponse.success(res, null, "Stock updated");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

    // DELETE /api/concessions/:id
    async delete(req, res) {
        try {
            const id = req.params.id;
            await concessionService.delete(id);
            return ApiResponse.success(res, null, "Concession deleted");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

}

module.exports = { ConcessionController };