import { useState } from "react";
import { Star, Shield, ChevronDown, MessageSquare } from "lucide-react";

export default function ReviewsSection({
  reviews = [],
  reviewStats = { avgRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
  hasReviewed = false,
  userReview = null,
  showReviewForm,
  setShowReviewForm,
  newRating,
  setNewRating,
  newReviewText,
  setNewReviewText,
  submittingReview,
  handleSubmitReview,
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "EXCELLENT";
    if (rating >= 4.0) return "VERY GOOD";
    if (rating >= 3.5) return "GOOD";
    if (rating >= 3.0) return "AVERAGE";
    return "FAIR";
  };

  const getRatingBg = (rating) => {
    if (rating >= 4) return '#1ab64f';
    if (rating >= 3) return '#f0ad4e';
    return '#e74c3c';
  };

  return (
    <div className="px-4 md:px-0 py-5 md:py-6" style={{ borderBottom: '1px solid #e8e8e8' }}>
      <h2 className="text-[22px] font-bold text-[#222] mb-5">Ratings and reviews</h2>

      {/* Rating Summary — OYO style */}
      {reviewStats.totalReviews > 0 && (
        <div className="flex items-start gap-6 mb-6">
          {/* Big Rating Block */}
          <div className="flex-shrink-0 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-lg font-bold" style={{ background: getRatingBg(reviewStats.avgRating) }}>
              {reviewStats.avgRating > 0 ? reviewStats.avgRating.toFixed(1) : "—"}
              <Star size={14} className="fill-white text-white" />
            </div>
            <p className="text-[#222] text-xs font-bold mt-2 uppercase">{getRatingLabel(reviewStats.avgRating)}</p>
            <p className="text-[#6d787d] text-xs mt-0.5">{reviewStats.totalReviews} ratings</p>
          </div>

          {/* Rating Breakdown Bars — OYO style */}
          <div className="flex-1 space-y-2 pt-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewStats.ratingBreakdown[star] || 0;
              const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
              const barColor = star >= 4 ? '#f19c38' : star >= 3 ? '#f0ad4e' : '#e74c3c';
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#6d787d] w-4 text-right">{star}</span>
                  <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percentage}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {!hasReviewed && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="w-full mb-5 py-3 bg-white rounded-lg font-semibold text-sm transition-colors"
          style={{ border: '2px solid #EE4266', color: '#EE4266' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EE4266'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#EE4266'; }}
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && !hasReviewed && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 rounded-lg" style={{ background: '#fafafa', border: '1px solid #e8e8e8' }}>
          <h3 className="font-bold text-[#222] mb-4 text-sm">Write Your Review</h3>
          <div className="mb-4">
            <label className="text-xs font-medium text-[#6d787d] mb-2 block">Your Rating</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: star <= newRating ? '#f19c38' : '#f0f0f0',
                    color: star <= newRating ? '#fff' : '#aaa',
                  }}
                >
                  <Star size={18} fill={star <= newRating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-[#6d787d] mb-2 block">Your Experience</label>
            <textarea
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Share your experience with this property..."
              className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4266]/30 focus:border-[#EE4266] min-h-[100px] text-sm resize-none"
              style={{ border: '1px solid #e0e0e0' }}
              maxLength={500}
            />
            <p className="text-xs text-[#aaa] mt-1 text-right">{newReviewText.length}/500</p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submittingReview || !newReviewText.trim()}
              className="flex-1 py-2.5 text-white rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#EE4266' }}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2.5 rounded-lg font-medium text-sm text-[#6d787d]"
              style={{ border: '1px solid #e0e0e0' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* User's Existing Review */}
      {hasReviewed && userReview && (
        <div className="mb-5 p-4 rounded-lg" style={{ background: '#eef7ee', border: '1px solid #c6e6c6' }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-[#1ab64f]" />
            <span className="text-xs font-semibold text-[#1ab64f]">Your Review</span>
            <span className="px-2 py-0.5 bg-white text-[#1ab64f] text-[10px] rounded font-medium" style={{ border: '1px solid #c6e6c6' }}>Submitted</span>
          </div>
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < userReview.rating ? "text-[#f19c38] fill-[#f19c38]" : "text-gray-200"} />
            ))}
          </div>
          <p className="text-[#222] text-sm">{userReview.review}</p>
        </div>
      )}

      {/* Individual Reviews — OYO style */}
      <div className="space-y-0">
        {reviews.length === 0 ? (
          <p className="text-[#6d787d] text-center py-8 text-sm">No reviews yet. Be the first to review!</p>
        ) : (
          <>
            {displayedReviews.map((review, idx) => (
              <div key={idx} className="py-4" style={{ borderBottom: idx < displayedReviews.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Avatar — OYO style simple circle */}
                    <div className="w-9 h-9 rounded-full bg-[#e8e8e8] flex items-center justify-center text-[#6d787d] text-sm font-bold">
                      {review.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#222] text-sm">{review.name || "Anonymous"}</p>
                        <span className="text-[#6d787d] text-xs">•</span>
                        <span className="text-xs text-[#6d787d]">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Rating badge — OYO style */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-bold" style={{ background: getRatingBg(review.rating) }}>
                    {review.rating}<Star size={10} className="fill-white text-white" />
                  </div>
                </div>
                <p className="text-[#6d787d] text-sm leading-relaxed ml-[48px]">{review.review}</p>
              </div>
            ))}

            {/* See all reviews — OYO style link */}
            {reviews.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-3 text-[#EE4266] font-semibold text-sm hover:underline flex items-center gap-1"
              >
                {showAll ? "Show less" : `See all reviews`}
                <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
