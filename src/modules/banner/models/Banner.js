const { Schema, model, Types } = require("mongoose");

const BannerSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String },
  position: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = model("Banner", BannerSchema);
