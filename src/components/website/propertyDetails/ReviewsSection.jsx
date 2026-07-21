import { useState } from "react";
import { Star, Shield, ChevronDown, MessageSquare, Edit2, MessageCircle } from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

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
  reviewError,
  // Editing rating states
  isEditingRating,
  setIsEditingRating,
  editRatingValue,
  setEditRatingValue,
  editRatingText,
  setEditRatingText,
  updatingRating,
  handleUpdateRating,
  // Commenting states
  commentText,
  setCommentText,
  submittingComment,
  handleSubmitComment,
  commentError,
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

      {/* Policy Notice Banner */}
      <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 bg-slate-50 border border-slate-100 shadow-sm">
        <Shield size={16} className="text-[#6d787d] mt-0.5 shrink-0" />
        <p className="text-xs text-[#6d787d] leading-normal">
          <strong>Review Policy:</strong> Reviews can only be submitted by active tenants who have already moved in, or ex-tenants of this property.
        </p>
      </div>

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

      {/* User's Star Rating Block */}
      {hasReviewed && userReview && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
          {!isEditingRating ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[#1ab64f]" />
                  <span className="text-xs font-semibold text-[#1ab64f]">Your Rating</span>
                  <span className="px-2 py-0.5 bg-white text-[#1ab64f] text-[10px] rounded font-medium border border-emerald-100">Submitted</span>
                </div>
                <button 
                  onClick={() => setIsEditingRating(true)} 
                  className="flex items-center gap-1 text-xs text-[#EE4266] font-semibold hover:underline"
                >
                  <Edit2 size={12} /> Edit Rating
                </button>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < userReview.rating ? "text-[#f19c38] fill-[#f19c38]" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-[#222] text-sm font-medium">{userReview.review || userReview.reviewText}</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateRating} className="space-y-4">
              <h3 className="font-bold text-[#222] text-sm">Edit Your Star Rating</h3>
              
              <div>
                <label className="text-xs font-medium text-[#6d787d] mb-2 block">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRatingValue(star)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: star <= editRatingValue ? '#f19c38' : '#f0f0f0',
                        color: star <= editRatingValue ? '#fff' : '#aaa',
                      }}
                    >
                      <Star size={16} fill={star <= editRatingValue ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#6d787d] mb-2 block">Experience</label>
                <textarea
                  value={editRatingText}
                  onChange={(e) => setEditRatingText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EE4266]/30 focus:border-[#EE4266] min-h-[80px] text-sm resize-none bg-white"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updatingRating || !editRatingText.trim()}
                  className="flex-1 py-2 bg-[#EE4266] text-white rounded-lg font-semibold text-xs disabled:opacity-40"
                >
                  {updatingRating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingRating(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg font-medium text-xs bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Write a Star Rating Form (If not rated yet) */}
      {!hasReviewed && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="w-full mb-6 py-3 bg-white rounded-lg font-semibold text-sm transition-colors border-2 border-[#EE4266] text-[#EE4266] hover:bg-[#EE4266] hover:text-white"
        >
          Submit Star Rating
        </button>
      )}

      {showReviewForm && !hasReviewed && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-150">
          <h3 className="font-bold text-[#222] mb-4 text-sm">Write Your Review & Star Rating</h3>
          
          {reviewError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-semibold leading-normal flex items-start gap-2">
              <Shield size={14} className="text-red-500 mt-0.5 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

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
              className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EE4266]/30 focus:border-[#EE4266] min-h-[100px] text-sm resize-none bg-white"
              maxLength={500}
            />
            <p className="text-xs text-[#aaa] mt-1 text-right">{newReviewText.length}/500</p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submittingReview || !newReviewText.trim()}
              className="flex-1 py-2.5 text-white rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed bg-[#EE4266]"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-sm text-[#6d787d] bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Post a Comment Form - Always available for tenants to comment as many times as they want */}
      <div className="mb-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm">
        <h3 className="font-bold text-[#222] mb-3 text-sm flex items-center gap-1.5">
          <MessageCircle size={16} className="text-[#EE4266]" /> Post a Comment
        </h3>
        {commentError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-semibold flex items-start gap-2">
            <Shield size={14} className="text-red-500 mt-0.5 shrink-0" />
            <span>{commentError}</span>
          </div>
        )}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Post a comment or update about this property..."
            className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EE4266]/30 focus:border-[#EE4266] min-h-[70px] text-sm resize-none bg-white"
            maxLength={300}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">{commentText.length}/300 characters</span>
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-5 py-2 bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>

      {/* Individual Reviews & Comments feed */}
      <div className="space-y-0">
        {reviews.length === 0 ? (
          <p className="text-[#6d787d] text-center py-8 text-sm">No reviews or comments yet. Be the first to post!</p>
        ) : (
          <>
            {displayedReviews.map((review, idx) => {
              const isCommentOnly = !review.rating || review.rating === 0;
              return (
                <div key={idx} className="py-4" style={{ borderBottom: idx < displayedReviews.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-[#e8e8e8] flex items-center justify-center text-[#6d787d] text-sm font-bold">
                        {review.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#222] text-sm">{review.name || "Anonymous"}</p>
                          <span className="text-[#6d787d] text-xs">•</span>
                          <span className="text-xs text-[#6d787d]">
                            {new Date(review.createdAt || review.reviewDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {isCommentOnly && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200">
                              <MessageSquare size={10} /> Comment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Rating badge — hide if comment-only */}
                    {!isCommentOnly && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-bold" style={{ background: getRatingBg(review.rating) }}>
                        {review.rating}<Star size={10} className="fill-white text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[#6d787d] text-sm leading-relaxed ml-[48px]">{review.review || review.reviewText}</p>
                </div>
              );
            })}

            {/* See all reviews */}
            {reviews.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-3 text-[#EE4266] font-semibold text-sm hover:underline flex items-center gap-1"
              >
                {showAll ? "Show less" : `See all reviews & comments`}
                <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
