// showtime.model.js
const { Schema, model, Types } = require("mongoose");
const ShowtimeStatus = require("./enums/showtime-status"); // object JS

const ShowtimeSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  hall: { type: Types.ObjectId, ref: "Hall", required: true },
  movie: { type: Types.ObjectId, ref: "Movie", required: true },
  price: { type: Number, required: true, default: 0 },
  status: { type: String, enum: Object.values(ShowtimeStatus), default: ShowtimeStatus.ACTIVE }
}, { timestamps: true });

// Index để tìm kiếm nhanh
ShowtimeSchema.index({ movie: 1, startTime: 1 });
ShowtimeSchema.index({ hall: 1, startTime: 1 });

const Showtime = model("Showtime", ShowtimeSchema);

module.exports = Showtime;
