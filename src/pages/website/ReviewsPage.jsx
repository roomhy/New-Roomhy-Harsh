import { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, X } from 'lucide-react';
import WebsiteNavbar from '../../components/website/WebsiteNavbar';
import WebsiteFooter from '../../components/website/WebsiteFooter';
import { getWebsiteSession, getWebsiteApiUrl } from '../../utils/websiteSession';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [toast, setToast] = useState(null);
  const apiUrl = getWebsiteApiUrl();
  const session = getWebsiteSession();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/reviews/user/${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating || 5,
      comment: review.comment || review.review || ''
    });
  };

  const handleUpdate = async () => {
    if (!editForm.comment.trim()) {
      showToast('Please enter a review comment', 'error');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/reviews/${editingReview._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          rating: editForm.rating,
          comment: editForm.comment
        })
      });

      if (response.ok) {
        showToast('Review updated successfully', 'success');
        setEditingReview(null);
        fetchReviews();
      } else {
        showToast('Failed to update review', 'error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Failed to update review', 'error');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });

      if (response.ok) {
        showToast('Review deleted successfully', 'success');
        fetchReviews();
      } else {
        showToast('Failed to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsiteNavbar />

      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reviews</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">You haven't written any reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < (review.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment || review.review}</p>
                      <p className="text-sm text-gray-500">
                        {review.propertyName || 'Property'} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <WebsiteFooter />

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Review</h2>
              <button
                onClick={() => setEditingReview(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEditForm({ ...editForm, rating })}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= editForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Write your review..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold"
                >
                  Update Review
                </button>
                <button
                  onClick={() => setEditingReview(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg"
          style={{
            background:
              toast.type === 'error'
                ? '#ef4444'
                : toast.type === 'success'
                  ? '#10b981'
                  : '#3b82f6'
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
