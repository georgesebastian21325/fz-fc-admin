import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const AuthenticationCode = () => {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    userEmail: null,
  });

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Only include active users who are not the admin and have not authenticated
        const approved = usersList.filter(
          (user) =>
            user.active &&
            !user.isAuthenticated &&
            user.email !== 'lifestylefitnessgymlfg1@gmail.com' // Exclude admin email
        );
        setApprovedUsers(approved);
      } catch (error) {
        console.error('Error fetching approved users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedUsers();
  }, []); // Effect runs once on component mount

  const generateAuthCode = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit random code
  };

  const openConfirmModal = (userId, email) => {
    setConfirmModal({
      isOpen: true,
      userId,
      userEmail: email,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      userId: null,
      userEmail: null,
    });
  };

  const handleGenerateCode = async () => {
    const { userId, userEmail } = confirmModal;
    const authCode = generateAuthCode();

    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { authCode: authCode });

      // Update the list of approved users
      setApprovedUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, authCode: authCode } : user
        )
      );

      closeConfirmModal();
      alert(`Authentication code generated for ${userEmail}`);
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate authentication code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-12xl mx-auto">
        <div className="text-start mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
            Authentication Codes
          </h1>
          <p className="text-gray-600">
            Generate authentication codes for approved users
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-2xl shadow-xl">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl border border-green-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm text-gray-700">
                <thead className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left font-semibold w-64">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        Authentication Code
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center font-semibold w-48">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {approvedUsers.length > 0 ? (
                    approvedUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={`${
                          idx % 2 === 0 ? 'bg-white' : 'bg-green-50/30'
                        } hover:bg-green-50 transition-colors duration-150`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {user.authCode ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg border border-green-200 font-mono font-bold text-base shadow-sm">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {user.authCode}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg border border-gray-200 font-medium text-sm">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              Not Generated
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {!user.authCode && (
                            <button
                              onClick={() =>
                                openConfirmModal(user.id, user.email)
                              }
                              className="bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-lg text-xs hover:from-green-700 hover:to-green-600 focus:ring-4 focus:ring-green-300 transition-all duration-200 font-medium shadow-md hover:shadow-lg inline-flex items-center gap-2"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Generate Code
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-16 px-6 text-center bg-gradient-to-b from-white to-green-50/30"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4">
                            <svg
                              className="w-10 h-10 text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-lg font-semibold text-gray-600">
                            No approved users found
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Users will appear here once they are approved
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Generate Authentication Code
                </h3>
                <p className="text-green-100 text-sm">
                  Create a new 6-digit code
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-base mb-4">
                Are you sure you want to generate an authentication code for{' '}
                <span className="font-semibold text-gray-900">
                  {confirmModal.userEmail}
                </span>
                ?
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> This will create a unique 6-digit code
                  for the user to authenticate their account.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateCode}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg focus:ring-4 focus:ring-green-300 transition-all duration-200 font-medium shadow-md"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticationCode;
