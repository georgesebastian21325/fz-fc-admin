import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

import ArchiveTable from '@/components/members-archive/ArchiveTable';
import ConfirmModal from '@/components/members-archive/ConfirmModal';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const openConfirmModal = (type, userId, userName) => {
    setConfirmModal({ isOpen: true, type, userId, userName });
    setIsSuccess(false);
  };

  const closeConfirmModal = () => {
    if (!isProcessing && !isSuccess) {
      setConfirmModal({
        isOpen: false,
        type: null,
        userId: null,
        userName: null,
      });
      setIsSuccess(false);
    }
  };

  const deleteUserPermanently = async (userId) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'deleted' });
      setArchivedUsers((prev) => prev.filter((user) => user.id !== userId));

      // Show success state
      setIsProcessing(false);
      setIsSuccess(true);

      // Auto-reset after modal closes
      setTimeout(() => {
        setConfirmModal({
          isOpen: false,
          type: null,
          userId: null,
          userName: null,
        });
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error deleting user permanently:', error);
      setIsProcessing(false);
      alert('Failed to delete user. Please try again.');
    }
  };

  const restoreUser = async (userId) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'active' });
      setArchivedUsers((prev) => prev.filter((user) => user.id !== userId));

      // Show success state
      setIsProcessing(false);
      setIsSuccess(true);

      // Auto-reset after modal closes
      setTimeout(() => {
        setConfirmModal({
          isOpen: false,
          type: null,
          userId: null,
          userName: null,
        });
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error restoring user:', error);
      setIsProcessing(false);
      alert('Failed to restore user. Please try again.');
    }
  };

  const handleConfirm = () => {
    if (confirmModal.type === 'restore') restoreUser(confirmModal.userId);
    if (confirmModal.type === 'delete')
      deleteUserPermanently(confirmModal.userId);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-8 text-start">
        Members Archive
      </h1>

      <ArchiveTable
        archivedUsers={archivedUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        openConfirmModal={openConfirmModal}
      />

      <ConfirmModal
        confirmModal={confirmModal}
        closeConfirmModal={closeConfirmModal}
        handleConfirm={handleConfirm}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
      />
    </div>
  );
};

export default MembersArchive;
