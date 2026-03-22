const { Schema, model } = require("mongoose");

const SystemSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

module.exports = model("SystemSetting", SystemSettingSchema);
