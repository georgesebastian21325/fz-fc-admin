import React from 'react';

const ArchiveRow = ({
  user,
  selectedUsers,
  setSelectedUsers,
  openConfirmModal,
}) => {
  return (
    <tr className="border-b border-green-50 hover:bg-green-50 transition-colors duration-150">
      <td className="py-4 px-6">
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() =>
            setSelectedUsers((prev) =>
              prev.includes(user.id)
                ? prev.filter((id) => id !== user.id)
                : [...prev, user.id]
            )
          }
          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
        />
      </td>

      <td className="py-4 px-6 font-medium text-gray-800">{user.email}</td>

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
          onClick={() => openConfirmModal('restore', user.id, user.email)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 mr-2 shadow-sm"
        >
          Restore
        </button>

        <button
          onClick={() => openConfirmModal('delete', user.id, user.email)}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 shadow-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ArchiveRow;
