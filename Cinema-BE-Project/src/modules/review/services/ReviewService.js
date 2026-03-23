const mongoose = require("mongoose");
const Review = require("../models/Review");
const Movie = require("../../movie/models/Movie");

class ReviewService {
  calculateStats(reviews) {
    if (!reviews?.length) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Math.round((sum / total) * 10) / 10;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
    });
    return { average, total, distribution };
  }

  async getReviewsByMovie(movieUUID) {
    const movie = await Movie.findOne({ UUID: movieUUID });
    if (!movie) throw new Error("Movie not found");

    const reviews = await Review.find({
      movieId: movie._id,
      status: "Approved",
    })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);

    const allApproved = await Review.find({
      movieId: movie._id,
      status: "Approved",
    });

    const stats = this.calculateStats(allApproved);

    const list = reviews.map((r) => ({
      id: r._id,
      userName:
        r.userId?.fullName || r.userName || r.userId?.email || "Ẩn danh",
      rating: r.rating,
      comment: r.comment,
      helpfulCount: r.helpfulCount,
      createdAt: r.createdAt,
    }));

    return { reviews: list, stats };
  }

  async createReview({ userId, userName, movieUUID, rating, comment }) {
    const movie = await Movie.findOne({ UUID: movieUUID });
    if (!movie) throw new Error("Movie not found");

    const uid = new mongoose.Types.ObjectId(String(userId));

    const existing = await Review.findOne({ userId: uid, movieId: movie._id });
    if (existing) throw new Error("Bạn đã đánh giá phim này rồi");

    try {
      const review = await Review.create({
        userId: uid,
        userName: userName || "Khách",
        movieId: movie._id,
        rating: Number(rating),
        comment: String(comment).trim(),
        status: "Pending",
      });
      return review;
    } catch (e) {
      if (e && e.code === 11000) {
        throw new Error("Bạn đã đánh giá phim này rồi");
      }
      throw e;
    }
  }

  async getAllReviews(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    return Review.find(query)
      .populate("userId", "fullName email")
      .populate("movieId", "title UUID")
      .sort({ createdAt: -1 });
  }

  async moderateReview(id, action) {
    const review = await Review.findById(id);
    if (!review) throw new Error("Review not found");
    if (action === "APPROVED") review.status = "Approved";
    else if (action === "HIDDEN") review.status = "Hidden";
    else throw new Error("Invalid action");
    await review.save();
    return review;
  }

  async deleteReview(id) {
    const r = await Review.findByIdAndDelete(id);
    if (!r) throw new Error("Review not found");
    return r;
  }
}

module.exports = ReviewService;
