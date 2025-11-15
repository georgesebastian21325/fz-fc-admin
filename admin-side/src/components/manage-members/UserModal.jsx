import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
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
  membershipDuration,
  setMembershipDuration,
  verifiedUsers,
  setVerifiedUsers,
  setPromptMessage,
  setShowPrompt,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const calculateRemainingDays = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
  };

  const extendMembership = async () => {
    if (membershipDuration < 1) {
      setPromptMessage('Please enter a valid number of days.');
      setShowPrompt(true);
      return;
    }

    const currentExpiry = new Date(user.membershipExpiry);
    const newExpiry = new Date(
      currentExpiry.setDate(currentExpiry.getDate() + membershipDuration)
    );

    setVerifiedUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, membershipExpiry: newExpiry.toISOString() }
          : u
      )
    );

    setPromptMessage(`Membership extended by ${membershipDuration} day(s).`);
    setShowPrompt(true);
  };

  const shortenMembership = async () => {
    if (membershipDuration < 1) {
      setPromptMessage('Please enter a valid number of days.');
      setShowPrompt(true);
      return;
    }

    const currentExpiry = new Date(user.membershipExpiry);
    const today = new Date();
    const newExpiry = new Date(
      currentExpiry.setDate(currentExpiry.getDate() - membershipDuration)
    );
    if (newExpiry < today) {
      setPromptMessage("Cannot shorten membership beyond today's date.");
      setShowPrompt(true);
      return;
    }

    setVerifiedUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, membershipExpiry: newExpiry.toISOString() }
          : u
      )
    );

    setPromptMessage(`Membership shortened by ${membershipDuration} day(s).`);
    setShowPrompt(true);
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl relative">
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
              <p className="text-blue-100 text-sm">
                Manage user membership and details
              </p>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-semibold">Email</span>
              </div>
              <p className="text-gray-800 font-medium break-all">
                {user.email}
              </p>
            </div>

            {/* Name */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <User className="w-4 h-4" />
                <span className="font-semibold">Full Name</span>
              </div>
              <p className="text-gray-800 font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">Status</span>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm ${
                  user.active
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {user.active ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>

            {/* Remaining Days */}
            {user.membershipExpiry && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Remaining Days</span>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm ${
                    isExpiringSoon
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : isExpiringSoonish
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {remainingDays} days
                </span>
              </div>
            )}
          </div>

          {/* Membership Expiry - Full Width */}
          {user.membershipExpiry && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Membership Expiry</span>
              </div>
              <p className="text-blue-900 font-bold text-lg">
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

        {/* Membership Management */}
        <div className="p-6 pt-0 space-y-4">
          {/* Extend Membership */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-emerald-900 text-lg">
                Extend Membership
              </h4>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder="Enter days to add"
                className="flex-1 p-3 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                onChange={(e) => setMembershipDuration(Number(e.target.value))}
              />
              <button
                onClick={extendMembership}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Days
              </button>
            </div>
          </div>

          {/* Shorten Membership */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
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
                placeholder="Enter days to remove"
                className="flex-1 p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                onChange={(e) => setMembershipDuration(Number(e.target.value))}
              />
              <button
                onClick={shortenMembership}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Minus className="w-4 h-4" />
                Remove Days
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-rose-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md animate-in zoom-in-95 duration-200">
              {/* Warning Header */}
              <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 rounded-t-2xl">
                <div className="flex items-center gap-4">
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
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 text-lg mb-2">
                  Are you sure you want to delete this user's membership?
                </p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>User:</strong> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(user.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-rose-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
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
