const ApiResponse = require("../../../utils/ApiResponse");
const ReviewService = require("../services/ReviewService");

const reviewService = new ReviewService();

class ReviewController {
  // Public: List approved reviews for a movie
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

  // Customer: Check if user is eligible to review
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

  // Customer: Submit a new review
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

  // Manager/Admin: List reviews for moderation
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

  // Manager/Admin: Approve or hide a review
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

  // Manager/Admin: Delete a review
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
    }
  }
}

module.exports = ReviewController;
