import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const UserModal = ({
  user,
  onClose,
  onDelete,
  verifiedUsers,
  setVerifiedUsers,
  setPromptMessage,
  setShowPrompt,
}) => {
  const [extendDays, setExtendDays] = useState('');
  const [shortenDays, setShortenDays] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const calculateRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
  };

  const extendMembership = async () => {
    const days = Number(extendDays);
    if (!days || days < 1) {
      setPromptMessage('Please enter a valid number of days.');
      setShowPrompt(true);
      return;
    }

    try {
      const currentExpiry = new Date(user.membershipExpiry);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + days);

      await updateDoc(doc(db, 'users', user.id), {
        membershipExpiry: newExpiry.toISOString(),
      });

      setVerifiedUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, membershipExpiry: newExpiry.toISOString() }
            : u
        )
      );

      setPromptMessage(`Membership extended by ${days} day(s).`);
      setShowPrompt(true);
      setExtendDays('');
    } catch (error) {
      console.error(error);
      setPromptMessage('Failed to extend membership.');
      setShowPrompt(true);
    }
  };

  const shortenMembership = async () => {
    const days = Number(shortenDays);
    if (!days || days < 1) {
      setPromptMessage('Please enter a valid number of days.');
      setShowPrompt(true);
      return;
    }

    const today = new Date();
    const currentExpiry = new Date(user.membershipExpiry);
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() - days);

    if (newExpiry < today) {
      setPromptMessage("Cannot shorten membership beyond today's date.");
      setShowPrompt(true);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.id), {
        membershipExpiry: newExpiry.toISOString(),
      });

      setVerifiedUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, membershipExpiry: newExpiry.toISOString() }
            : u
        )
      );

      setPromptMessage(`Membership shortened by ${days} day(s).`);
      setShowPrompt(true);
      setShortenDays('');
    } catch (error) {
      console.error(error);
      setPromptMessage('Failed to shorten membership.');
      setShowPrompt(true);
    }
  };

  const remainingDays = user.membershipExpiry
    ? calculateRemainingDays(user.membershipExpiry)
    : 0;
  const isExpiringSoon = remainingDays <= 7;
  const isExpiringSoonish = remainingDays > 7 && remainingDays <= 30;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 z-40 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                User Profile
              </h3>
              <p className="text-green-100 text-sm">
                Manage user membership and details
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="font-semibold">Email</span>
              </div>
              <p className="text-gray-800 font-medium break-all">
                {user.email}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="font-semibold">Full Name</span>
              </div>
              <p className="text-gray-800 font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold">Status</span>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm shadow-sm ${
                  user.active
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200'
                }`}
              >
                {user.active ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>

            {user.membershipExpiry && (
              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Remaining Days</span>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm shadow-sm ${
                    isExpiringSoon
                      ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                      : isExpiringSoonish
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200'
                      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                  }`}
                >
                  {remainingDays} days
                </span>
              </div>
            )}
          </div>

          {/* Membership Expiry */}
          {user.membershipExpiry && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Membership Expiry</span>
              </div>
              <p className="text-green-900 font-bold text-lg">
                {new Date(user.membershipExpiry).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Extend & Shorten Membership */}
        <div className="p-6 pt-0 space-y-4">
          {/* Extend */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-md">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-green-900 text-lg">
                Extend Membership
              </h4>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={extendDays}
                placeholder="Enter days to add"
                className="flex-1 p-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                onChange={(e) => setExtendDays(e.target.value)}
              />
              <button
                onClick={extendMembership}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Days
              </button>
            </div>
          </div>

          {/* Shorten */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center shadow-md">
                <Minus className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-orange-900 text-lg">
                Shorten Membership
              </h4>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={shortenDays}
                placeholder="Enter days to remove"
                className="flex-1 p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                onChange={(e) => setShortenDays(e.target.value)}
              />
              <button
                onClick={shortenMembership}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-6 rounded-xl hover:from-orange-700 hover:to-orange-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Minus className="w-4 h-4" /> Remove Days
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete User
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Confirm Deletion
                  </h2>
                  <p className="text-red-100 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-lg mb-4 font-medium">
                  Are you sure you want to delete this user's membership?
                </p>
                <div className="bg-gradient-to-br from-gray-50 to-red-50/30 p-4 rounded-xl border border-red-200 shadow-sm">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong className="text-gray-900">User:</strong>{' '}
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Name:</strong>{' '}
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 py-3 px-6 rounded-xl hover:from-gray-300 hover:to-gray-400 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(user.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserModal;
