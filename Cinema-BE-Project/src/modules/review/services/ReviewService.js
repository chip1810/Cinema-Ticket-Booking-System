const mongoose = require("mongoose");
const Review = require("../models/Review");
const ReviewStatus = require("../models/enums/ReviewStatus");

const Movie = require("../../movie/models/Movie");
const Showtime = require("../../showtime/models/Showtime");
const ShowtimeStatus = require("../../showtime/models/enums/showtime-status");
const Ticket = require("../../ticket/models/Ticket");
const { Order, OrderStatus } = require("../../order/models/Order");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

class ReviewService {
  _statusToLabel(status) {
    if (!status) return "Unknown";
    return status.charAt(0) + status.slice(1).toLowerCase(); // PENDING -> Pending
  }

  _normalizeReviewStatus(value) {
    if (!value) return null;
    const raw = String(value).trim();

    // Hỗ trợ cả enum uppercase và label capitalize từ FE tab
    const map = {
      PENDING: ReviewStatus.PENDING,
      APPROVED: ReviewStatus.APPROVED,
      HIDDEN: ReviewStatus.HIDDEN,
      Pending: ReviewStatus.PENDING,
      Approved: ReviewStatus.APPROVED,
      Hidden: ReviewStatus.HIDDEN,
    };

    return map[raw] || null;
  }

  async _findMovieByUUID(movieUUID) {
    const movie = await Movie.findOne({ UUID: String(movieUUID).trim() });
    if (!movie) throw new Error("Movie not found");
    return movie;
  }

  async _findReviewByIdentifier(idOrUUID) {
    const key = String(idOrUUID).trim();
    const or = [{ UUID: key }];

    if (isObjectId(key)) {
      or.push({ _id: new mongoose.Types.ObjectId(key) });
    }

    const review = await Review.findOne({ $or: or }).populate("user movie moderatedBy");
    if (!review) throw new Error("Review not found");
    return review;
  }

  async _recalculateMovieRating(movieId) {
    const rows = await Review.find({
      movie: movieId,
      status: ReviewStatus.APPROVED,
    }).select("rating");

    if (!rows.length) {
      await Movie.updateOne({ _id: movieId }, { $set: { rating: null } });
      return null;
    }

    const avg = rows.reduce((sum, r) => sum + Number(r.rating || 0), 0) / rows.length;
    const rounded = Math.round(avg * 10) / 10; // 1 chữ số thập phân

    await Movie.updateOne({ _id: movieId }, { $set: { rating: rounded } });
    return rounded;
  }

  async _checkEligibility(movieId, userId) {
    const now = new Date();

    // Suất chiếu đã xong: status Finished hoặc đã qua endTime và không cancelled
    const endedShowtimes = await Showtime.find({
      movie: movieId,
      $or: [
        { status: ShowtimeStatus.FINISHED },
        {
          endTime: { $lt: now },
          status: { $ne: ShowtimeStatus.CANCELLED },
        },
      ],
    }).select("_id");

    if (!endedShowtimes.length) {
      return {
        eligible: false,
        reason: "Phim chưa chiếu xong nên chưa thể đánh giá",
      };
    }

    const paidOrders = await Order.find({
      user: userId,
      status: OrderStatus.PAID,
    }).select("_id");

    if (!paidOrders.length) {
      return {
        eligible: false,
        reason: "Bạn chưa có đơn đã thanh toán",
      };
    }

    const hasEligibleTicket = await Ticket.exists({
      user: userId,
      showtime: { $in: endedShowtimes.map((s) => s._id) },
      order: { $in: paidOrders.map((o) => o._id) },
    });

    if (!hasEligibleTicket) {
      return {
        eligible: false,
        reason: "Bạn chưa mua vé cho phim này hoặc suất chiếu chưa kết thúc",
      };
    }

    return { eligible: true, reason: null };
  }

  async getEligibility(movieUUID, userId) {
    const movie = await this._findMovieByUUID(movieUUID);

    const existing = await Review.findOne({ user: userId, movie: movie._id })
      .select("UUID status rating comment createdAt");

    if (existing) {
      return {
        eligible: false,
        reason: "Bạn đã đánh giá phim này rồi",
        alreadyReviewed: true,
        existingReview: {
          reviewUUID: existing.UUID,
          status: existing.status,
          rating: existing.rating,
          comment: existing.comment,
          createdAt: existing.createdAt,
        },
      };
    }

    const check = await this._checkEligibility(movie._id, userId);
    return {
      eligible: check.eligible,
      reason: check.reason,
      alreadyReviewed: false,
      existingReview: null,
    };
  }

  async createReview(movieUUID, userId, payload) {
    const movie = await this._findMovieByUUID(movieUUID);

    const rating = Number(payload?.rating);
    const comment = String(payload?.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("rating must be an integer from 1 to 5");
    }

    if (!comment) {
      throw new Error("comment is required");
    }

    if (comment.length > 1000) {
      throw new Error("comment must be <= 1000 characters");
    }

    const existing = await Review.findOne({ user: userId, movie: movie._id });
    if (existing) throw new Error("Bạn đã đánh giá phim này rồi");

    const check = await this._checkEligibility(movie._id, userId);
    if (!check.eligible) {
      throw new Error(check.reason || "Bạn chưa đủ điều kiện đánh giá");
    }

    const review = await Review.create({
      user: userId,
      movie: movie._id,
      rating,
      comment,
      status: ReviewStatus.APPROVED,
    });

    return {
      reviewUUID: review.UUID,
      movieUUID: movie.UUID,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
    };
  }

  async getMovieReviews(movieUUID, query = {}) {
    const movie = await this._findMovieByUUID(movieUUID);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      movie: movie._id,
      status: ReviewStatus.APPROVED,
    };

    const [rows, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    const avgRow = await Review.aggregate([
      { $match: { movie: movie._id, status: ReviewStatus.APPROVED } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);

    const averageRating = avgRow.length ? Math.round(avgRow[0].avgRating * 10) / 10 : null;
    const totalApproved = avgRow.length ? avgRow[0].total : 0;

    return {
      items: rows.map((r) => ({
        reviewUUID: r.UUID,
        userName: r.user?.fullName || r.user?.email || "Anonymous",
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        date: r.createdAt,
      })),
      stats: {
        averageRating,
        totalApprovedReviews: totalApproved,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getReviewsForModeration(params = {}) {
    const status = this._normalizeReviewStatus(params.status);
    const q = String(params.q || "").trim().toLowerCase();
    const movieUUID = String(params.movieUUID || "").trim();

    const filter = {};
    if (status) filter.status = status;

    if (movieUUID) {
      const movie = await Movie.findOne({ UUID: movieUUID }).select("_id");
      filter.movie = movie ? movie._id : null;
    }

    const rows = await Review.find(filter)
      .populate("user", "fullName email")
      .populate("movie", "title UUID")
      .populate("moderatedBy", "fullName email")
      .sort({ createdAt: -1 });

    const filtered = q
      ? rows.filter((r) => {
          const userName = (r.user?.fullName || r.user?.email || "").toLowerCase();
          const movieTitle = (r.movie?.title || "").toLowerCase();
          const comment = (r.comment || "").toLowerCase();
          return userName.includes(q) || movieTitle.includes(q) || comment.includes(q);
        })
      : rows;

    // Format để khớp FE manager hiện tại
    return filtered.map((r) => ({
      id: r.UUID,
      reviewUUID: r.UUID,
      userName: r.user?.fullName || r.user?.email || "Anonymous",
      movieTitle: r.movie?.title || "Unknown movie",
      rating: r.rating,
      comment: r.comment,
      status: this._statusToLabel(r.status), // Pending/Approved/Hidden
      date: r.createdAt,
      createdAt: r.createdAt,
      moderatedBy: r.moderatedBy?.fullName || r.moderatedBy?.email || null,
      moderatedAt: r.moderatedAt || null,
      moderationNote: r.moderationNote || "",
    }));
  }

  async moderateReview(idOrUUID, action, moderatorId, moderationNote = "") {
    const nextStatus = this._normalizeReviewStatus(action);
    if (!nextStatus || ![ReviewStatus.APPROVED, ReviewStatus.HIDDEN].includes(nextStatus)) {
      throw new Error("action must be APPROVED or HIDDEN");
    }

    const review = await this._findReviewByIdentifier(idOrUUID);

    review.status = nextStatus;
    review.moderatedBy = moderatorId;
    review.moderatedAt = new Date();
    review.moderationNote = String(moderationNote || "").trim();

    await review.save();
    await this._recalculateMovieRating(review.movie._id);

    return {
      reviewUUID: review.UUID,
      status: review.status,
      moderatedAt: review.moderatedAt,
    };
  }

  async deleteReview(idOrUUID) {
    const review = await this._findReviewByIdentifier(idOrUUID);
    const movieId = review.movie?._id || review.movie;

    await Review.deleteOne({ _id: review._id });
    await this._recalculateMovieRating(movieId);

    return {
      reviewUUID: review.UUID,
      deleted: true,
    };
  }
}

module.exports = ReviewService;
