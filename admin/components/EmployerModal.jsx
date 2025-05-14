import React from "react";
import {
  Mail,
  Phone,
  BadgeCheck,
  Calendar,
  UserCircle,
  ShieldCheck,
} from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-2 border-b border-slate-700/60 last:border-b-0">
    <div className="flex-shrink-0 w-6 mr-3 pt-0.5">
      <Icon className="h-5 w-5 text-slate-400" />
    </div>
    <div className="flex-1">
      <span className="font-medium text-slate-300">{label}:</span>
      <span className="ml-2 text-slate-200 break-words">{value || "N/A"}</span>
    </div>
  </div>
);

const EmployerModal = ({ isOpen, onClose, employer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700/80 transform transition-all duration-300 ease-out">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Thông tin Nhà tuyển dụng
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 transition-all"
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto styled-scrollbar">
          {employer ? (
            <div className="space-y-3">
              <InfoRow
                icon={UserCircle}
                label="Họ và tên"
                value={employer.fullName}
              />
              <InfoRow icon={Mail} label="Email" value={employer.email} />
              <InfoRow
                icon={Phone}
                label="Số điện thoại"
                value={employer.phoneNumber}
              />
              <InfoRow
                icon={BadgeCheck}
                label="Vai trò"
                value={employer.role}
              />
              <InfoRow
                icon={ShieldCheck}
                label="Trạng thái hoạt động"
                value={employer.isActive ? "Đang hoạt động" : "Bị khóa"}
              />
              <InfoRow
                icon={Calendar}
                label="Ngày tạo"
                value={new Date(employer.createdAt).toLocaleDateString("vi-VN")}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-slate-600 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-slate-400 text-lg">
                Không có thông tin nhà tuyển dụng.
              </p>
              <p className="text-slate-500 text-sm">
                Vui lòng kiểm tra lại dữ liệu.
              </p>
            </div>
          )}
        </div>

        {employer && (
          <div className="px-5 py-4 border-t border-slate-700 text-right">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 rounded-lg bg-slate-600 text-slate-100 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 ease-in-out font-medium"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerModal;
