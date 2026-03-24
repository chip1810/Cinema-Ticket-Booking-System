const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const ReviewSchema = new Schema(
  {
    UUID: {
      type: String,
      unique: true,
      default: () => new Types.ObjectId().toString(),
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "Khách" },
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Hidden"],
      default: "Pending",
    },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReviewSchema.index({ movieId: 1, status: 1 });
ReviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
