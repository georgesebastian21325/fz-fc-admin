import { Trash2, CheckCircle } from 'lucide-react';

export default function DeleteModal({
  onClose,
  onDelete,
  isDeleting,
  isSuccess,
}) {
  // Auto-close after success animation
  if (isSuccess) {
    setTimeout(() => {
      onClose();
    }, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {!isSuccess ? (
          // Delete confirmation state
          <>
            <div className="p-6 bg-red-600 text-white flex items-center gap-4">
              <Trash2 className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Delete Feedback</h3>
                <p className="text-red-100 text-sm">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this feedback?
              </p>

              <div className="flex gap-3 items-center">
                <button
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg focus:ring-4 focus:ring-red-300 transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
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
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Success state
          <div className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Successfully Deleted!
            </h3>
            <p className="text-gray-600">
              The feedback has been permanently removed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
