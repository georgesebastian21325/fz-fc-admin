import React from 'react';
import ArchiveRow from './ArchiveRow';
import EmptyState from './EmptyState';

const ArchiveTable = ({
  archivedUsers,
  selectedUsers,
  setSelectedUsers,
  selectAll,
  setSelectAll,
  openConfirmModal,
}) => {
  return (
    <div className="relative mb-8">
      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-green-100">
        <table className="w-full table-auto text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-green-600 to-green-500 text-white">
            <tr>
              <th className="py-4 px-6 text-left font-semibold w-16">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={() => {
                    setSelectAll(!selectAll);
                    setSelectedUsers(
                      !selectAll ? archivedUsers.map((u) => u.id) : []
                    );
                  }}
                  className="w-4 h-4 rounded border-white focus:ring-2 focus:ring-green-300"
                />
              </th>
              <th className="py-4 px-6 text-left font-semibold">Email</th>
              <th className="py-4 px-6 text-left font-semibold w-40">Status</th>
              <th className="py-4 px-6 text-left font-semibold w-48">
                Membership Expiry
              </th>
              <th className="py-4 px-6 text-left font-semibold w-64">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {archivedUsers.length > 0 ? (
              archivedUsers.map((user) => (
                <ArchiveRow
                  key={user.id}
                  user={user}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  openConfirmModal={openConfirmModal}
                />
              ))
            ) : (
              <EmptyState colSpan={5} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchiveTable;
