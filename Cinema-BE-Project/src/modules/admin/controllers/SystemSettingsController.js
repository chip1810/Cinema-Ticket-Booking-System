const ApiResponse = require("../../../utils/ApiResponse");
const SystemSetting = require("../models/SystemSetting");

class SystemSettingsController {
  async getAll(_req, res) {
    try {
      const settings = await SystemSetting.find();
      const result = settings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      return ApiResponse.success(res, result, "System settings fetched", 200);
    } catch {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async upsert(req, res) {
    try {
      const payload = req.body || {};
      const keys = Object.keys(payload);
      if (!keys.length) {
        return ApiResponse.error(res, "Empty payload", 400);
      }

      const saved = await Promise.all(
        keys.map((key) =>
          SystemSetting.findOneAndUpdate(
            { key },
            { value: String(payload[key]) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          )
        )
      );

      const result = saved.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});

      return ApiResponse.success(res, result, "System settings updated", 200);
    } catch {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
}

module.exports = SystemSettingsController;
