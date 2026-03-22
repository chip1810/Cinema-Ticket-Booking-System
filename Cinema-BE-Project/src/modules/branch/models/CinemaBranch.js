const { Schema, model, Types } = require("mongoose");

const CinemaBranchSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  hotline: { type: String, required: true },
  halls: [{ type: Types.ObjectId, ref: "Hall" }],
}, { timestamps: true });

module.exports = model("CinemaBranch", CinemaBranchSchema);
