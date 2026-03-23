const ReviewService = require("../services/ReviewService");
const ApiResponse = require("../../../utils/ApiResponse");
const { UserRole } = require("../../auth/models/User");

const reviewService = new ReviewService();

class ReviewController {
  async getByMovie(req, res) {
    try {
      const { uuid } = req.params;
      const result = await reviewService.getReviewsByMovie(uuid);
      return ApiResponse.success(res, result, "OK");
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }

  async getAll(req, res) {
    try {
      const { status } = req.query;
      const reviews = await reviewService.getAllReviews({ status });
      const formatted = reviews.map((r) => ({
        id: r._id,
        userName: r.userId?.fullName || r.userName || "Anonymous",
        movieTitle: r.movieId?.title,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        date: r.createdAt?.toISOString?.(),
        createdAt: r.createdAt,
      }));
      return ApiResponse.success(res, formatted, "OK");
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }

  /** Chỉ khách hàng (customer) đã đăng nhập được gửi đánh giá */
  async create(req, res) {
    try {
      if (req.user?.role !== UserRole.CUSTOMER) {
        return ApiResponse.error(
          res,
          "Chỉ tài khoản khách hàng mới được viết đánh giá",
          403
        );
      }

      const { movieUUID, rating, comment } = req.body;
      if (!movieUUID || rating == null || !String(comment || "").trim()) {
        return ApiResponse.error(res, "Thiếu movieUUID, rating hoặc nội dung", 400);
      }

      const r = Number(rating);
      if (r < 1 || r > 5 || !Number.isInteger(r)) {
        return ApiResponse.error(res, "Điểm đánh giá từ 1 đến 5", 400);
      }

      const { User } = require("../../auth/models/User");
      const u = await User.findById(req.user.id).select("fullName email");
      const userName = u?.fullName || u?.email?.split("@")[0] || "Khách";

      const review = await reviewService.createReview({
        userId: req.user.id,
        userName,
        movieUUID,
        rating: r,
        comment,
      });

      return ApiResponse.success(
        res,
        review,
        "Đã gửi đánh giá. Nội dung sẽ hiển thị sau khi được duyệt.",
        201
      );
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async moderate(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const review = await reviewService.moderateReview(id, action);
      return ApiResponse.success(res, review, "OK");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await reviewService.deleteReview(id);
      return ApiResponse.success(res, null, "Deleted");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }
}

module.exports = ReviewController;
