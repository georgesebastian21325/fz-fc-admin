import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const MembersArchive = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    userId: null,
    userName: null,
  });

  // Fetch archived users
  useEffect(() => {
    const fetchArchivedUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const archived = usersList.filter((user) => user.status === 'archived');
        setArchivedUsers(archived);
      } catch (error) {
        console.error('Error fetching archived users:', error);
      }
    };

    fetchArchivedUsers();
  }, []);

  // Open confirmation modal
  const openConfirmModal = (type, userId, userName) => {
    setConfirmModal({
      isOpen: true,
      type,
      userId,
      userName,
    });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      userId: null,
      userName: null,
    });
  };

  // Mark user as "deleted" in Firestore
  const deleteUserPermanently = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: 'deleted' });
      setArchivedUsers((prev) => prev.filter((user) => user.id !== userId));
      closeConfirmModal();
      alert('User marked as deleted permanently.');
    } catch (error) {
      console.error('Error deleting user permanently:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  // Restore user from archive
  const restoreUser = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: 'active' });
      setArchivedUsers((prev) => prev.filter((user) => user.id !== userId));
      closeConfirmModal();
      alert('User restored successfully.');
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (confirmModal.type === 'restore') {
      restoreUser(confirmModal.userId);
    } else if (confirmModal.type === 'delete') {
      deleteUserPermanently(confirmModal.userId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-8 text-center">
        Members Archive
      </h1>
      <div className="relative mb-8">
        <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-green-100">
          <table className="w-full table-auto text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-green-600 to-green-500 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => {
                      setSelectAll(!selectAll);
                      setSelectedUsers(
                        !selectAll ? archivedUsers.map((user) => user.id) : []
                      );
                    }}
                    className="w-4 h-4 rounded border-white focus:ring-2 focus:ring-green-300"
                  />
                </th>
                <th className="py-4 px-6 text-left font-semibold">Email</th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-left font-semibold">
                  Membership Expiry
                </th>
                <th className="py-4 px-6 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {archivedUsers.length > 0 ? (
                archivedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-green-50 hover:bg-green-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => {
                          setSelectedUsers((prevSelected) =>
                            prevSelected.includes(user.id)
                              ? prevSelected.filter((id) => id !== user.id)
                              : [...prevSelected, user.id]
                          );
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {user.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Archived
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {user.membershipExpiry
                        ? new Date(user.membershipExpiry).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() =>
                          openConfirmModal('restore', user.id, user.email)
                        }
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 mr-2 shadow-sm"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() =>
                          openConfirmModal('delete', user.id, user.email)
                        }
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 shadow-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-12 px-6 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        No archived members found.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div
                className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                  confirmModal.type === 'restore'
                    ? 'bg-gradient-to-br from-green-100 to-green-200'
                    : 'bg-gradient-to-br from-red-100 to-red-200'
                }`}
              >
                {confirmModal.type === 'restore' ? (
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {confirmModal.type === 'restore'
                  ? 'Restore User'
                  : 'Delete User Permanently'}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmModal.type === 'restore'
                  ? `Are you sure you want to restore `
                  : `Are you sure you want to permanently delete `}
                <span className="font-semibold text-gray-800">
                  {confirmModal.userName}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 text-white py-3 px-4 rounded-lg focus:ring-4 transition-all duration-200 font-medium shadow-md ${
                    confirmModal.type === 'restore'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-300'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300'
                  }`}
                >
                  {confirmModal.type === 'restore' ? 'Restore' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersArchive;
