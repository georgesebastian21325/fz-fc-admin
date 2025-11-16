import React from 'react';

const ConfirmModal = ({
  confirmModal,
  closeConfirmModal,
  handleConfirm,
  isProcessing,
  isSuccess,
}) => {
  if (!confirmModal.isOpen) return null;

  // Auto-close after success animation
  if (isSuccess) {
    setTimeout(() => {
      closeConfirmModal();
    }, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {!isSuccess ? (
          // Confirmation state
          <>
            <div
              className={`p-6 flex items-center gap-4 ${
                confirmModal.type === 'restore'
                  ? 'bg-gradient-to-r from-green-600 to-green-500'
                  : 'bg-gradient-to-r from-red-600 to-red-500'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {confirmModal.type === 'restore' ? (
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : (
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {confirmModal.type === 'restore'
                    ? 'Restore User'
                    : 'Delete User Permanently'}
                </h3>
                <p
                  className={`text-sm ${
                    confirmModal.type === 'restore'
                      ? 'text-green-100'
                      : 'text-red-100'
                  }`}
                >
                  {confirmModal.type === 'restore'
                    ? 'This will reactivate the user'
                    : 'This action cannot be undone'}
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 text-base mb-4">
                {confirmModal.type === 'restore'
                  ? 'Are you sure you want to restore '
                  : 'Are you sure you want to permanently delete '}
                <span className="font-semibold text-gray-900">
                  {confirmModal.userName}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`flex-1 text-white py-3 px-4 rounded-lg focus:ring-4 transition-all duration-200 font-medium shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirmModal.type === 'restore'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-300'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {confirmModal.type === 'restore' ? 'Restore' : 'Delete'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Success state
          <div className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-500 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {confirmModal.type === 'restore'
                ? 'User Restored Successfully!'
                : 'User Deleted Successfully!'}
            </h3>
            <p className="text-gray-600">
              {confirmModal.type === 'restore'
                ? `${confirmModal.userName} has been restored to active status.`
                : `${confirmModal.userName} has been permanently deleted.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmModal;
