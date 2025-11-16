import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import {
  Star,
  MessageSquare,
  Calendar,
  Trash2,
  Filter,
  Search,
  X,
  User,
} from 'lucide-react';

const UserFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    feedbackId: null,
    feedbackUid: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [filterRating, setFilterRating] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    byCategory: {},
  });

  // Fetch all feedback from Firebase
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Apply filters and search whenever inputs change
  useEffect(() => {
    applyFilters();
  }, [feedbackList, filterRating, filterCategory, searchQuery]);

  // Fetch feedback from all users
  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const feedbackPromises = usersSnapshot.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        const feedbackSnapshot = await getDocs(
          collection(db, `users/${uid}/feedback`)
        );
        return feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          uid,
          name: userDoc.data().name || 'Anonymous',
          ...doc.data(),
        }));
      });

      const feedbackArrays = await Promise.all(feedbackPromises);
      const allFeedback = feedbackArrays.flat();
      allFeedback.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setFeedbackList(allFeedback);
      calculateStats(allFeedback);
    } catch (err) {
      console.error(err);
      setError('Failed to load feedback.');
      showToast('Failed to load feedback.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats (total, avg rating, by category)
  const calculateStats = (data) => {
    const total = data.length;
    const avgRating =
      total > 0
        ? (data.reduce((sum, fb) => sum + (fb.rating || 0), 0) / total).toFixed(
            1
          )
        : 0;
    const byCategory = data.reduce((acc, fb) => {
      const cat = fb.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    setStats({ total, avgRating, byCategory });
  };

  // Apply rating/category filters and search query
  const applyFilters = () => {
    let filtered = [...feedbackList];
    if (filterRating !== 'all')
      filtered = filtered.filter((fb) => fb.rating === parseInt(filterRating));
    if (filterCategory !== 'all')
      filtered = filtered.filter((fb) => fb.category === filterCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (fb) =>
          (fb.name || '').toLowerCase().includes(query) ||
          (fb.message || '').toLowerCase().includes(query)
      );
    }
    setFilteredFeedback(filtered);
  };

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Delete feedback
  const handleDeleteFeedback = async () => {
    if (!deleteModal.feedbackId || !deleteModal.feedbackUid) return;
    setIsDeleting(true);
    try {
      await deleteDoc(
        doc(
          db,
          'users',
          deleteModal.feedbackUid,
          'feedback',
          deleteModal.feedbackId
        )
      );
      setFeedbackList((prev) =>
        prev.filter((fb) => fb.id !== deleteModal.feedbackId)
      );
      showToast('Feedback deleted successfully.', 'success');
      setDeleteModal({ isOpen: false, feedbackId: null, feedbackUid: null });
      if (selectedFeedback?.id === deleteModal.feedbackId)
        setSelectedFeedback(null);
    } catch (error) {
      console.error(error);
      showToast('Failed to delete feedback.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format timestamp
  const formatDate = (timestamp) =>
    timestamp
      ? new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'No date';

  // Render star rating
  const StarRating = ({ value, size = 16 }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((num) => (
        <Star
          key={num}
          size={size}
          className={
            num <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }
        />
      ))}
    </div>
  );

  // Category color mapping
  const getCategoryColor = (category) => {
    const colors = {
      General:
        'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300',
      Equipment:
        'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300',
      Staff:
        'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300',
      Cleanliness:
        'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border-teal-300',
      Classes:
        'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300',
      Other:
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
    };
    return colors[category] || colors['Other'];
  };

  const categories = [...new Set(feedbackList.map((fb) => fb.category))];

  if (loading)
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-4 border-green-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
          User Feedback
        </h1>
        <p className="text-gray-600">
          Manage and review user feedback and ratings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-md">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Feedback</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-md">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgRating}
              </p>
              <StarRating value={Math.round(stats.avgRating)} size={14} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Filtered Results
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredFeedback.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filters{' '}
            {(filterRating !== 'all' || filterCategory !== 'all') && '(Active)'}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <X className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No feedback found
          </h3>
          <p className="text-gray-500">
            {feedbackList.length === 0
              ? 'No feedback has been submitted yet.'
              : 'Try adjusting your filters or search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((fb) => (
            <div
              key={fb.id}
              className="bg-white rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0">
                    {(fb.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {fb.name || 'Anonymous User'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />{' '}
                      {formatDate(fb.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFeedback(fb)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        feedbackId: fb.id,
                        feedbackUid: fb.uid,
                      })
                    }
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <StarRating value={fb.rating || 0} size={18} />
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getCategoryColor(
                    fb.category
                  )}`}
                >
                  {fb.category || 'Uncategorized'}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-2">
                {fb.message || 'No message provided.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Feedback Details
                  </h3>
                  <p className="text-green-100 text-sm">
                    Complete feedback information
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Name</span>
                </div>
                <p className="text-gray-800 font-medium">
                  {selectedFeedback.name || 'Anonymous User'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Rating</span>
                </div>
                <StarRating value={selectedFeedback.rating || 0} size={24} />
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Filter className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Category</span>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getCategoryColor(
                    selectedFeedback.category
                  )}`}
                >
                  {selectedFeedback.category || 'Uncategorized'}
                </span>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Submitted</span>
                </div>
                <p className="text-gray-800 font-medium">
                  {formatDate(selectedFeedback.timestamp)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Message</span>
                </div>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {selectedFeedback.message || 'No message provided.'}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDeleteModal({
                    isOpen: true,
                    feedbackId: selectedFeedback.id,
                  });
                  setSelectedFeedback(null);
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Delete Feedback
                </h3>
                <p className="text-red-100 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-base mb-4">
                Are you sure you want to delete this feedback? This will
                permanently remove it from the system.
              </p>
              <div className="flex gap-3 items-center justify-center">
                <button
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      feedbackId: null,
                      feedbackUid: null,
                    })
                  }
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFeedback}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg focus:ring-4 focus:ring-red-300 transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          } transition-all`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default UserFeedback;
