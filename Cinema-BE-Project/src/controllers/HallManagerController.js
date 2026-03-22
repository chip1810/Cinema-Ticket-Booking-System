const { hallManagerService } = require("../services/HallManagerService");
const ApiResponse = require("../utils/ApiResponse");

const ok = (res, data, msg, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res, e, code = 400) => ApiResponse.error(res, e.message ?? e, code);

class HallManagerController {
  async getAllHalls(_req, res) {
    try {
      return ok(res, await hallManagerService.getAllHalls(), "Halls fetched");
    } catch (e) {
      return fail(res, e, 500);
    }
  }

  async getHallById(req, res) {
    try {
      return ok(res, await hallManagerService.getHallById(req.params.id), "Hall fetched");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async createHall(req, res) {
    try {
      const { name, type, capacity } = req.body || {};
      if (!name || !capacity) return fail(res, { message: "name and capacity are required" });
      return ok(res, await hallManagerService.createHall({ name, type, capacity }), "Hall created", 201);
    } catch (e) {
      return fail(res, e);
    }
  }

  async updateHall(req, res) {
    try {
      return ok(res, await hallManagerService.updateHall(req.params.id, req.body || {}), "Hall updated");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async deleteHall(req, res) {
    try {
      await hallManagerService.deleteHall(req.params.id);
      return ok(res, null, "Hall deleted");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async setSeatLayout(req, res) {
    try {
      const seats = req.body?.seats;
      if (!Array.isArray(seats)) return fail(res, { message: "seats[] is required" });
      const result = await hallManagerService.setSeatLayout(req.params.id, seats);
      return ok(res, result, "Seat layout updated", 201);
    } catch (e) {
      return fail(res, e);
    }
  }

  async getSeatLayout(req, res) {
    try {
      return ok(res, await hallManagerService.getSeatLayout(req.params.id), "Seat layout fetched");
    } catch (e) {
      return fail(res, e, 404);
    }
  }
}

module.exports = HallManagerController;
