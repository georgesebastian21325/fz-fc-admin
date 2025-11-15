import React from 'react';

const PromptModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <p className="text-xl text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default PromptModal;
