import React from "react";
import {
  FileText,
  CalendarDays,
  BadgeDollarSign,
  ListOrdered,
  Clock,
} from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-2 border-b border-slate-700/60 last:border-b-0">
    <div className="w-6 mr-3 pt-0.5">
      <Icon className="h-5 w-5 text-slate-400" />
    </div>
    <div className="flex-1">
      <span className="font-medium text-slate-300">{label}:</span>
      <span className="ml-2 text-slate-200 break-words">{value || "N/A"}</span>
    </div>
  </div>
);

const PackageModalView = ({ isOpen, onClose, packages }) => {
  if (!isOpen) return null;
  console.log(packages);

  return (
    <div className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl border border-slate-700/80">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
            Chi tiết Gói
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto styled-scrollbar space-y-3">
          <InfoRow icon={FileText} label="Tên gói" value={packages?.label} />
          <InfoRow
            icon={CalendarDays}
            label="Ngày tạo"
            value={new Date(packages?.createdAt).toLocaleString()}
          />
          <InfoRow
            icon={ListOrdered}
            label="Lượt đăng"
            value={packages?.posts}
          />
          <InfoRow
            icon={Clock}
            label="Thời hạn (ngày)"
            value={packages?.duration}
          />
          <InfoRow
            icon={BadgeDollarSign}
            label="Giá (VNĐ)"
            value={packages?.priceVND?.toLocaleString()}
          />

          <div className="text-slate-300 leading-relaxed mt-4">
            <h3 className="font-semibold text-white mb-2">Mô tả:</h3>
            <p className="whitespace-pre-wrap">
              {packages?.description || "Không có mô tả."}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 rounded-lg text-white hover:bg-slate-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageModalView;
