const mongoose = require("mongoose");
const PricingRule = require("../modules/pricing_rule/models/PricingRule");
const Showtime = require("../modules/showtime/models/Showtime");
const ApiResponse = require("../utils/ApiResponse");

const ok = (res, data, msg, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res, e, code = 400) => ApiResponse.error(res, e.message ?? e, code);
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const resolveShowtime = async (showtimeId) => {
  if (!showtimeId) return null;
  if (isObjectId(showtimeId)) {
    const st = await Showtime.findById(showtimeId);
    if (st) return st;
  }
  return Showtime.findOne({ UUID: showtimeId });
};

class PricingManagerController {
  async getByShowtime(req, res) {
    try {
      const showtimeId = req.params.showtimeId;
      const showtime = await resolveShowtime(showtimeId);
      if (!showtime) return fail(res, { message: "Showtime not found" }, 404);
      const rules = await PricingRule.find({ showtime: showtime._id });
      return ok(res, rules, "Pricing rules fetched");
    } catch (e) {
      return fail(res, e, 500);
    }
  }

  async setRules(req, res) {
    try {
      const { showtimeId, rules } = req.body || {};
      if (!showtimeId || !Array.isArray(rules) || !rules.length) {
        return fail(res, { message: "showtimeId and rules[] are required" });
      }

      const showtime = await resolveShowtime(showtimeId);
      if (!showtime) return fail(res, { message: "Showtime not found" }, 404);

      await PricingRule.deleteMany({ showtime: showtime._id });

      const saved = await PricingRule.insertMany(
        rules.map((r) => ({
          showtime: showtime._id,
          seatType: r.seatType,
          price: r.price,
        }))
      );

      return ok(res, saved, "Pricing rules updated", 201);
    } catch (e) {
      return fail(res, e);
    }
  }

  async deleteByShowtime(req, res) {
    try {
      const showtime = await resolveShowtime(req.params.showtimeId);
      if (!showtime) return fail(res, { message: "Showtime not found" }, 404);
      await PricingRule.deleteMany({ showtime: showtime._id });
      return ok(res, null, "Pricing rules deleted");
    } catch (e) {
      return fail(res, e, 500);
    }
  }
}

module.exports = PricingManagerController;
