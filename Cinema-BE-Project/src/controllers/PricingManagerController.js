// PricingManagerController.js
const PricingRule = require("../modules/seat/models/PricingRule");
const Showtime = require("../modules/showtime/models/Showtime");
const SeatType = require("../modules/seat/models/enums/SeatType");
const ApiResponse = require("../utils/ApiResponse");

const ok = (res, data, msg, code = 200) =>
  ApiResponse.success(res, data, msg, code);

const fail = (res, e, code = 400) =>
  ApiResponse.error(res, e.message || e, code);

class PricingManagerController {

  // GET /api/manager/pricing/:showtimeUUID
  async getByShowtime(req, res) {
    try {
      const showtimeUUID = req.params.showtimeUUID;

      const showtime = await Showtime.findOne({ UUID: showtimeUUID });
      if (!showtime) return fail(res, "Showtime not found", 404);

      const rules = await PricingRule.find({ showtime: showtime._id });

      return ok(res, rules, "Pricing rules fetched");

    } catch (e) {
      return fail(res, e, 500);
    }
  }

  // POST /api/manager/pricing
  // Body: { showtimeUUID, rules: [{ seatType, price }] }
  async setRules(req, res) {
    try {
      const { showtimeUUID, rules } = req.body;

      if (!showtimeUUID || !Array.isArray(rules) || !rules.length) {
        return fail(res, "showtimeUUID and rules[] are required");
      }

      const showtime = await Showtime.findOne({ UUID: showtimeUUID });
      if (!showtime) return fail(res, "Showtime not found", 404);

      // validate seatType
      const validTypes = Object.values(SeatType);
      for (const r of rules) {
        if (!validTypes.includes(r.seatType)) {
          return fail(res, `Invalid seatType: ${r.seatType}`);
        }
      }

      // 🔥 xóa cũ → insert mới
      await PricingRule.deleteMany({ showtime: showtime._id });

      const newRules = rules.map((r) => ({
        showtime: showtime._id,
        seatType: r.seatType,
        price: r.price,
      }));

      const saved = await PricingRule.insertMany(newRules);

      return ok(res, saved, "Pricing rules updated", 201);

    } catch (e) {
      return fail(res, e);
    }
  }

  // DELETE /api/manager/pricing/:showtimeUUID
  async deleteByShowtime(req, res) {
    try {
      const showtimeUUID = req.params.showtimeUUID;

      const showtime = await Showtime.findOne({ UUID: showtimeUUID });
      if (!showtime) return fail(res, "Showtime not found", 404);

      await PricingRule.deleteMany({ showtime: showtime._id });

      return ok(res, null, "Pricing rules deleted");

    } catch (e) {
      return fail(res, e, 500);
    }
  }
}

module.exports = PricingManagerController;