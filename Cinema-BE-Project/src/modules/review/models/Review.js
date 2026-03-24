<<<<<<< HEAD
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderatorNote: {
    type: String,
    trim: true,
    maxlength: 500
  },
  moderatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ movie: 1, rating: -1 });
reviewSchema.index({ user: 1 });

module.exports = mongoose.model('Review', reviewSchema);
=======
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
>>>>>>> origin/main
