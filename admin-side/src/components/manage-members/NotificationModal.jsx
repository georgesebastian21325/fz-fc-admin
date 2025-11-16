import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const NotificationModal = ({ message, onClose, type = 'success' }) => {
  const isSuccess = type === 'success';

  // Auto-close after animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            {isSuccess ? (
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 animate-bounce" />
            )}
          </div>
          <h3
            className={`text-2xl font-bold mb-2 ${
              isSuccess ? 'text-gray-800' : 'text-red-700'
            }`}
          >
            {isSuccess ? 'Success!' : 'Error'}
          </h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
