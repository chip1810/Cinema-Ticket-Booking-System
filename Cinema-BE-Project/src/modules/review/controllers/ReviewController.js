<<<<<<< HEAD
const Review = require("../models/Review");
const ApiResponse = require("../../../utils/ApiResponse");

const ok = (res, data, msg, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res, e, code = 400) => ApiResponse.error(res, e.message ?? e, code);

class ReviewController {
  async getAll(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      let filter = {};
      if (status) {
        filter.status = { $regex: new RegExp(`^${status}$`, 'i') };
      }
      
      const reviews = await Review.find(filter)
        .populate('user', 'fullName email')
        .populate('movie', 'title')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
        
      const total = await Review.countDocuments(filter);
      
      return ok(res, {
        reviews,
        pagination: {
          current: page,
          pageSize: limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, "Reviews fetched successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return fail(res, message, 500);
    }
  }

  async moderate(req, res) {
    try {
      const reviewId = req.params.id;
      const { status, moderatorNote } = req.body || {};
      
      if (!reviewId) {
        return fail(res, { message: "Review ID is required" }, 400);
      }
      
      if (!status || !['approved', 'rejected', 'flagged'].includes(status)) {
        return fail(res, { message: "Valid status is required (approved, rejected, flagged)" }, 400);
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return fail(res, { message: "Review not found" }, 404);
      }

      review.status = status;
      review.moderatorNote = moderatorNote || '';
      review.moderatedAt = new Date();
      
      await review.save();
      
      return ok(res, review, `Review ${status} successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return fail(res, message, 500);
    }
  }

  async delete(req, res) {
    try {
      const reviewId = req.params.id;
      
      if (!reviewId) {
        return fail(res, { message: "Review ID is required" }, 400);
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return fail(res, { message: "Review not found" }, 404);
      }

      await Review.findByIdAndDelete(reviewId);
      
      return ok(res, null, "Review deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return fail(res, message, 500);
    }
  }

  async getByMovie(req, res) {
    try {
      const movieId = req.params.movieId;
      const reviews = await Review.find({ movie: movieId, status: 'approved' })
        .populate('user', 'fullName avatar')
        .sort({ createdAt: -1 });

      return ok(res, reviews, "Reviews fetched successfully");
    } catch (e) {
      return fail(res, e.message, 500);
=======
const ApiResponse = require("../../../utils/ApiResponse");
const ReviewService = require("../services/ReviewService");

const reviewService = new ReviewService();

class ReviewController {
  // Public: danh sách review approved theo movie
  async getByMovie(req, res) {
    try {
      const { movieUUID } = req.params;
      const result = await reviewService.getMovieReviews(movieUUID, req.query || {});
      return ApiResponse.success(res, result, "Reviews fetched successfully");
    } catch (e) {
      const msg = e?.message || "Internal Server Error";
      const code = msg === "Movie not found" ? 404 : 500;
      return ApiResponse.error(res, msg, code);
    }
  }

  // Customer: check đủ điều kiện review chưa
  async getEligibility(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    try {
      const { movieUUID } = req.params;
      const result = await reviewService.getEligibility(movieUUID, req.user.id);
      return ApiResponse.success(res, result, "Review eligibility checked");
    } catch (e) {
      const msg = e?.message || "Internal Server Error";
      const code = msg === "Movie not found" ? 404 : 500;
      return ApiResponse.error(res, msg, code);
    }
  }

  // Customer: tạo review
  async create(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    try {
      const { movieUUID } = req.params;
      const result = await reviewService.createReview(movieUUID, req.user.id, req.body || {});
      return ApiResponse.success(res, result, "Review submitted successfully", 201);
    } catch (e) {
      const msg = e?.message || "Internal Server Error";
      const known = [
        "Movie not found",
        "rating must be an integer from 1 to 5",
        "comment is required",
        "comment must be <= 1000 characters",
        "Bạn đã đánh giá phim này rồi",
        "Phim chưa chiếu xong nên chưa thể đánh giá",
        "Bạn chưa có đơn đã thanh toán",
        "Bạn chưa mua vé cho phim này hoặc suất chiếu chưa kết thúc",
      ];
      const code = known.includes(msg) ? 400 : 500;
      return ApiResponse.error(res, msg, code);
    }
  }

  // Manager/Admin: danh sách review để duyệt
  async listForModeration(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    try {
      const result = await reviewService.getReviewsForModeration(req.query || {});
      return ApiResponse.success(res, result, "Reviews fetched successfully");
    } catch (e) {
      const msg = e?.message || "Internal Server Error";
      return ApiResponse.error(res, msg, 500);
    }
  }

  // Manager/Admin: duyệt hoặc ẩn review
  async moderate(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    try {
      const { id } = req.params;
      const { action, moderationNote } = req.body || {};

      const result = await reviewService.moderateReview(
        id,
        action,
        req.user.id,
        moderationNote
      );

      return ApiResponse.success(res, result, "Review moderated successfully");
    } catch (e) {
      const msg = e?.message || "Internal Server Error";
      const code = msg === "Review not found" ? 404 : 400;
      return ApiResponse.error(res, msg, code);
    }
  }

  // Manager/Admin: xóa review
  async delete(req, res) {
    if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

    try {
      const { id } = req.params;
      const result = await reviewService.deleteReview(id);
      return ApiResponse.success(res, result, "Review deleted successfully");
    } catch (e) {
      const msg = e?.message || "Internal Server Error";
      const code = msg === "Review not found" ? 404 : 500;
      return ApiResponse.error(res, msg, code);
>>>>>>> origin/main
    }
  }
}

module.exports = ReviewController;
