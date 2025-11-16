import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

import UserTable from '../components/manage-members/UserTable';
import UserModal from '../components/manage-members/UserModal';
import RenewMembershipModal from '../components/manage-members/RenewMembershipModal';
import PromptModal from '../components/manage-members/PromptModal';

const ManageMembers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membershipDuration, setMembershipDuration] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [promptMessage, setPromptMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [sortOption, setSortOption] = useState('');
  const [emailSortOrder, setEmailSortOrder] = useState('asc');
  const [remainingDaysSortOrder, setRemainingDaysSortOrder] = useState('asc');
  const [renewModal, setRenewModal] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchAndUpdateUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredUsers = usersList.filter(
          (user) => user.email !== 'fitnesszc@gmail.com'
        );

        const today = new Date();
        const verified = [];
        const pending = [];
        const archived = [];

        for (const user of filteredUsers) {
          const expiryDate = user.membershipExpiry
            ? new Date(user.membershipExpiry)
            : null;

          if (user.status === 'active' && expiryDate && expiryDate < today) {
            const daysSinceExpiry = Math.ceil(
              (today - expiryDate) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceExpiry > 7) {
              await updateDoc(doc(db, 'users', user.id), {
                status: 'archived',
              });
              archived.push({ ...user, status: 'archived' });
            } else {
              verified.push(user);
            }
          } else if (user.status === 'active') {
            verified.push(user);
          } else if (user.status === 'pending') {
            pending.push(user);
          } else if (user.status === 'archived') {
            archived.push(user);
          }
        }

        setVerifiedUsers(verified);
        setPendingUsers(pending);
        setArchivedUsers(archived);
      } catch (error) {
        console.error('Error fetching users:', error);
        setPromptMessage('Failed to load users.');
        setShowPrompt(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAndUpdateUsers();
  }, []);

  // Helper: Calculate remaining days
  const calculateRemainingDays = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry - today;
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  };

  // Approve user
  const approveUser = async (userId) => {
    if (membershipDuration < 1 || membershipDuration > 12) {
      alert('Select a membership duration between 1-12 months.');
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, 'users', userId);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + membershipDuration * 30);

      await updateDoc(userDoc, {
        active: true,
        membershipExpiry: expiryDate.toISOString(),
        status: 'active',
      });

      const updatedUser = {
        id: userId,
        active: true,
        membershipExpiry: expiryDate.toISOString(),
        email: pendingUsers.find((user) => user.id === userId)?.email,
        status: 'active',
      };

      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      setVerifiedUsers((prev) => [...prev, updatedUser]);

      alert(`User approved for ${membershipDuration} month(s)!`);
    } catch (error) {
      console.error(error);
      setPromptMessage('Failed to approve user.');
      setShowPrompt(true);
    } finally {
      setLoading(false);
    }
  };

  // Deny user
  const denyUser = async (userId) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { active: false });
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      alert('User denied.');
    } catch (error) {
      console.error(error);
      setPromptMessage('Failed to deny user.');
      setShowPrompt(true);
    } finally {
      setLoading(false);
    }
  };

  // Delete/archive user
  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'archived' });
      const archivedUser = verifiedUsers.find((u) => u.id === userId);
      setVerifiedUsers((prev) => prev.filter((u) => u.id !== userId));
      setArchivedUsers((prev) => [...prev, archivedUser]);
      setPromptMessage('User archived successfully.');
      setShowPrompt(true);
    } catch (error) {
      console.error(error);
      setPromptMessage('Failed to archive user.');
      setShowPrompt(true);
    } finally {
      setLoading(false);
    }
  };

  // Renew membership
  const renewMembership = async (userId, months) => {
    if (months < 1 || months > 12) {
      setPromptMessage('Select a valid number of months (1-12).');
      setShowPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, 'users', userId);
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + months);

      await updateDoc(userDoc, {
        membershipExpiry: newExpiryDate.toISOString(),
        active: true,
      });

      setVerifiedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, membershipExpiry: newExpiryDate.toISOString() }
            : u
        )
      );

      setPromptMessage(
        `Membership renewed for ${months} month(s). New expiry: ${newExpiryDate.toLocaleDateString()}`
      );
      setShowPrompt(true);
      setRenewModal(false);
    } catch (error) {
      console.error(error);
      setPromptMessage('Failed to renew membership.');
      setShowPrompt(true);
    } finally {
      setLoading(false);
    }
  };

  // Open user modal
  const openUserModal = (userId) => {
    const user = [...verifiedUsers, ...pendingUsers].find(
      (u) => u.id === userId
    );
    setSelectedUser(user);
  };

  const closeModal = () => setSelectedUser(null);

  // Sorting handlers
  const handleSortEmail = () => {
    setEmailSortOrder(emailSortOrder === 'asc' ? 'desc' : 'asc');
    sortUsers('email', emailSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSortRemainingDays = () => {
    setRemainingDaysSortOrder(
      remainingDaysSortOrder === 'asc' ? 'desc' : 'asc'
    );
    sortUsers(
      'remainingDays',
      remainingDaysSortOrder === 'asc' ? 'desc' : 'asc'
    );
  };

  const sortUsers = (key, order) => {
    const sorted = [...verifiedUsers].sort((a, b) => {
      if (key === 'email')
        return order === 'asc'
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      if (key === 'remainingDays') {
        const aDays = calculateRemainingDays(a.membershipExpiry);
        const bDays = calculateRemainingDays(b.membershipExpiry);
        return order === 'asc' ? aDays - bDays : bDays - aDays;
      }
      return 0;
    });
    setVerifiedUsers(sorted);
  };

  return (
    <div className="min-h-screen  p-4 sm:p-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-8 text-start">
        Manage Users
      </h1>

      <UserTable
        users={verifiedUsers}
        type="verified"
        onRowClick={openUserModal}
        sortOptions={{
          emailSortOrder,
          remainingDaysSortOrder,
          sortOption,
          setSortOption,
          handleSortEmail,
          handleSortRemainingDays,
        }}
        membershipDuration={membershipDuration}
        setMembershipDuration={setMembershipDuration}
      />

      <UserTable
        users={pendingUsers}
        type="pending"
        onRowClick={openUserModal}
        membershipDuration={membershipDuration}
        setMembershipDuration={setMembershipDuration}
        onApprove={approveUser}
        onDeny={denyUser}
      />

      {selectedUser && !renewModal && (
        <UserModal
          user={selectedUser}
          onClose={closeModal}
          onDelete={deleteUser}
          setMembershipDuration={setMembershipDuration}
          membershipDuration={membershipDuration}
          verifiedUsers={verifiedUsers}
          setVerifiedUsers={setVerifiedUsers}
          setPromptMessage={setPromptMessage}
          setShowPrompt={setShowPrompt}
        />
      )}

      {renewModal && (
        <RenewMembershipModal
          user={selectedUser}
          membershipDuration={membershipDuration}
          setMembershipDuration={setMembershipDuration}
          onRenew={renewMembership}
          onCancel={() => setRenewModal(false)}
        />
      )}

      {showPrompt && (
        <PromptModal
          message={promptMessage}
          onClose={() => setShowPrompt(false)}
        />
      )}
    </div>
  );
};

export default ManageMembers;
