// components/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50  bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-semibold mb-6 text-slate-100 text-center sm:text-left">
          {message}
        </h2>
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 ease-in-out font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 ease-in-out font-medium"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
