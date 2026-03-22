const { Schema, model, Types } = require("mongoose");
const ConcessionType = require("./enums/ConcessionType");

const ConcessionSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ConcessionType), required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = model("Concession", ConcessionSchema);
