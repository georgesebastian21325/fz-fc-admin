import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { FaStar } from 'react-icons/fa';

const UserFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'user_feedback'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbackList(data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const StarRating = ({ value }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((num) => (
        <FaStar
          key={num}
          size={16}
          className={num <= value ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Feedback</h2>

      {feedbackList.length === 0 ? (
        <p className="text-gray-500">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className="p-5 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              {/* Top Section */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {fb.name || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {formatDate(fb.timestamp)}
                  </p>
                </div>

                {/* Star Rating */}
                <StarRating value={fb.rating} />
              </div>

              {/* Category */}
              <div className="mt-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium">
                  {fb.category}
                </span>
              </div>

              {/* Feedback Message */}
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                {fb.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFeedback;
