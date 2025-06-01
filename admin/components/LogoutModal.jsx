// components/LogoutModal.jsx
import React from "react";
import { LogOut, X } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700/80"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-full hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-slate-600"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-500/30 mb-5">
            <LogOut className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-slate-100">
            Xác nhận Đăng xuất
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại?
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onClose}
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-150 ease-in-out font-medium"
            >
              Hủy bỏ
            </button>

            <button
              onClick={onConfirm}
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-150 ease-in-out font-semibold"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
