import { useEffect, useMemo, useState } from "react";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { reviewService } from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";

function Stars({ value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(s)}
          className={`transition ${disabled ? "cursor-not-allowed opacity-70" : "hover:scale-110"}`}
        >
          <Star
            size={18}
            className={s <= value ? "text-amber-400 fill-amber-400" : "text-slate-600"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ movieUUID }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState({
    eligible: false,
    reason: "Đang kiểm tra...",
    alreadyReviewed: false,
    existingReview: null,
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(user);

  const loadReviews = async () => {
    const res = await reviewService.getMovieReviews(movieUUID, { page: 1, limit: 20 });
    setReviews(res?.data?.items || []);
  };

  const loadEligibility = async () => {
    if (!isLoggedIn) {
      setEligibility({
        eligible: false,
        reason: "Đăng nhập để đánh giá phim",
        alreadyReviewed: false,
        existingReview: null,
      });
      return;
    }

    try {
      const res = await reviewService.getEligibility(movieUUID);
      setEligibility(res?.data || {});
    } catch (e) {
      setEligibility({
        eligible: false,
        reason: e?.response?.data?.message || e?.message || "Không kiểm tra được điều kiện đánh giá",
        alreadyReviewed: false,
        existingReview: null,
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadReviews(), loadEligibility()]);
      } catch {
        if (mounted) setError("Không tải được dữ liệu đánh giá");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [movieUUID, isLoggedIn]);

  const canSubmit = useMemo(
    () => isLoggedIn && eligibility?.eligible && comment.trim().length > 0 && rating >= 1 && rating <= 5,
    [isLoggedIn, eligibility, comment, rating]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      await reviewService.submitReview(movieUUID, {
        rating,
        comment: comment.trim(),
      });

      setComment("");
      setRating(5);

      await Promise.all([loadReviews(), loadEligibility()]);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-bold mb-6">Đánh giá & Bình luận</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-black/25 p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-red-500" />
            Viết đánh giá
          </h3>

          {loading ? (
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Đang tải...
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-3">
                {eligibility?.eligible
                  ? "Bạn đủ điều kiện đánh giá phim này."
                  : eligibility?.reason || "Bạn chưa đủ điều kiện đánh giá."}
              </p>

              {eligibility?.alreadyReviewed && eligibility?.existingReview && (
                <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                  Bạn đã gửi đánh giá thành công.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Số sao</label>
                  <div className="mt-2">
                    <Stars
                      value={rating}
                      onChange={setRating}
                      disabled={!eligibility?.eligible || submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Bình luận</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Chia sẻ cảm nhận của bạn..."
                    disabled={!eligibility?.eligible || submitting}
                    className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm outline-none focus:border-red-500/40 disabled:opacity-60"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">{comment.length}/1000</p>
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Gửi đánh giá
                </button>
              </form>
            </>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/25 p-5">
          <h3 className="font-bold mb-4">Đánh giá từ khán giả</h3>

          {loading ? (
            <div className="text-sm text-slate-400">Đang tải danh sách đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-slate-500">Chưa có đánh giá nào được hiển thị.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.reviewUUID}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm">{r.userName || "Anonymous"}</p>
                    <span className="text-xs text-slate-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : ""}
                    </span>
                  </div>

                  <div className="mt-2">
                    <Stars value={Number(r.rating) || 0} disabled />
                  </div>

                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}