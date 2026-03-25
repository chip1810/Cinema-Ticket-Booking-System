const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const reviewSchema = new Schema(
  {
    UUID: {
      type: String,
      unique: true,
      default: () => new Types.ObjectId().toString(),
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "HIDDEN"],
      default: "PENDING",
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    moderationNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
reviewSchema.index({ movie: 1, status: 1 });
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
