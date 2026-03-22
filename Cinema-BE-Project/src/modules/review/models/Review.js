const { Schema, model, Types } = require("mongoose");
const ReviewStatus = require("./enums/ReviewStatus");

const ReviewSchema = new Schema(
  {
    UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
    user: { type: Types.ObjectId, ref: "User", required: true },
    movie: { type: Types.ObjectId, ref: "Movie", required: true },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },

    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING,
    },

    moderatedBy: { type: Types.ObjectId, ref: "User", default: null },
    moderatedAt: { type: Date, default: null },
    moderationNote: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

// 1 user chỉ review 1 lần cho 1 movie
ReviewSchema.index({ user: 1, movie: 1 }, { unique: true });
ReviewSchema.index({ movie: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = model("Review", ReviewSchema);