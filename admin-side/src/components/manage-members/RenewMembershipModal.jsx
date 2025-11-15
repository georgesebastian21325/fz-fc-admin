import React from 'react';

const RenewMembershipModal = ({
  user,
  membershipDuration,
  setMembershipDuration,
  onRenew,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Renew Membership for {user?.email}
        </h2>
        <select
          className="w-full p-2 sm:p-3 border rounded-lg mb-4"
          value={membershipDuration}
          onChange={(e) => setMembershipDuration(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {month} Month(s)
            </option>
          ))}
        </select>
        <div className="flex justify-between">
          <button
            onClick={() => onRenew(user.id, membershipDuration)}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
          >
            Renew
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewMembershipModal;
