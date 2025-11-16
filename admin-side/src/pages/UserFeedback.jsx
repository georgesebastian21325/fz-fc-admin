'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

import FeedbackStats from '@/components/user-feedback/FeedbackStats';
import FeedbackFilters from '@/components/user-feedback/FeedbackFilters';
import FeedbackList from '@/components/user-feedback/FeedbackList';
import FeedbackModal from '@/components/user-feedback/FeedbackModal';
import DeleteModal from '@/components/user-feedback/DeleteModal';

import { formatDate, getCategoryColor } from '@/components/user-feedback/utils';

export default function UserFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    byCategory: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    feedbackId: null,
    feedbackUid: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedbackList, filterRating, filterCategory, searchQuery]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const feedbackPromises = usersSnapshot.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        const userData = userDoc.data();

        const fullName =
          `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
          'Anonymous';

        const fbSnap = await getDocs(collection(db, `users/${uid}/feedback`));

        return fbSnap.docs.map((fbDoc) => ({
          id: fbDoc.id,
          uid,
          name: fullName,
          ...fbDoc.data(),
        }));
      });

      const feedbackArrays = await Promise.all(feedbackPromises);
      const allFeedback = feedbackArrays.flat();

      allFeedback.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setFeedbackList(allFeedback);
      calculateStats(allFeedback);
    } catch (err) {
      setError('Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const avgRating =
      total > 0
        ? (data.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1)
        : 0;

    const byCategory = data.reduce((acc, f) => {
      const c = f.category || 'Uncategorized';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});

    setStats({ total, avgRating, byCategory });
  };

  const applyFilters = () => {
    let result = [...feedbackList];

    if (filterRating !== 'all')
      result = result.filter((f) => f.rating === parseInt(filterRating));

    if (filterCategory !== 'all')
      result = result.filter((f) => f.category === filterCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          (f.name || '').toLowerCase().includes(q) ||
          (f.message || '').toLowerCase().includes(q)
      );
    }

    setFilteredFeedback(result);
  };

  const handleDeleteFeedback = async () => {
    if (!deleteModal.feedbackId) return;

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

      // Update the feedback list
      setFeedbackList((prev) =>
        prev.filter((f) => f.id !== deleteModal.feedbackId)
      );

      // Close the detail modal if open
      if (selectedFeedback?.id === deleteModal.feedbackId) {
        setSelectedFeedback(null);
      }

      // Show success state
      setIsDeleting(false);
      setIsSuccess(true);

      // Auto-reset after the modal closes itself
      setTimeout(() => {
        setDeleteModal({ isOpen: false, feedbackId: null, feedbackUid: null });
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
      // You can add error handling UI here if needed
      alert('Failed to delete feedback. Please try again.');
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting && !isSuccess) {
      setDeleteModal({ isOpen: false, feedbackId: null, feedbackUid: null });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-2">User Feedback</h1>
      <p className="text-gray-600 mb-6">
        Manage and review user feedback and ratings.
      </p>

      <FeedbackStats stats={stats} filteredCount={filteredFeedback.length} />

      <FeedbackFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterRating={filterRating}
        setFilterRating={setFilterRating}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={[...new Set(feedbackList.map((f) => f.category))]}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {error && <p className="text-red-600">{error}</p>}

      <FeedbackList
        feedback={filteredFeedback}
        formatDate={formatDate}
        getCategoryColor={getCategoryColor}
        setSelectedFeedback={setSelectedFeedback}
        setDeleteModal={setDeleteModal}
      />

      {selectedFeedback && (
        <FeedbackModal
          feedback={selectedFeedback}
          close={() => setSelectedFeedback(null)}
          getCategoryColor={getCategoryColor}
          formatDate={formatDate}
          setDeleteModal={setDeleteModal}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteModal
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteFeedback}
          isDeleting={isDeleting}
          isSuccess={isSuccess}
        />
      )}
    </div>
  );
}
