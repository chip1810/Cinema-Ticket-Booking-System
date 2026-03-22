import apiClient from "../api/apiClient";

export const reviewService = {
  // Public: lấy danh sách review đã duyệt của phim
  getMovieReviews: (movieUUID, params = {}) =>
    apiClient.get(`/reviews/movie/${movieUUID}`, { params }),

  // Customer: check đủ điều kiện đánh giá chưa
  getEligibility: (movieUUID) =>
    apiClient.get(`/reviews/movie/${movieUUID}/eligibility`),

  // Customer: gửi đánh giá
  submitReview: (movieUUID, data) =>
    apiClient.post(`/reviews/movie/${movieUUID}`, data),
};