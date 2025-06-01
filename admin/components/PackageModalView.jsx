import React from "react";
import {
  FileText,
  CalendarDays,
  BadgeDollarSign,
  ListOrdered,
  Clock,
} from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3 px-4 rounded-lg bg-slate-750 hover:bg-slate-700/60 transition-colors">
    <div className="mr-3 p-2 bg-slate-700 rounded-lg">
      <Icon className="h-5 w-5 text-lime-400" />
    </div>
    <div className="flex-1">
      <div className="font-medium text-slate-400 text-sm">{label}</div>
      <div className="mt-1 text-white font-medium text-lg">
        {value || <span className="text-slate-400">N/A</span>}
      </div>
    </div>
  </div>
);

const PackageModalView = ({ isOpen, onClose, packages }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-lime-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
              CHI TIẾT GÓI
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto styled-scrollbar space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              label="Thời hạn"
              value={`${packages?.duration} ngày`}
            />
            <div className="md:col-span-2">
              <InfoRow
                icon={BadgeDollarSign}
                label="Giá"
                value={
                  packages?.priceVND
                    ? `${packages.priceVND.toLocaleString()} VNĐ`
                    : null
                }
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center mb-3">
              <div className="h-0.5 w-8 bg-gradient-to-r from-green-500 to-lime-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Mô tả chi tiết
              </h3>
            </div>
            <div className="bg-slate-750 rounded-xl p-4 border border-slate-700">
              <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                {packages?.description || "Không có mô tả."}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl text-white font-medium border border-slate-600 shadow-lg transition-all duration-300 hover:shadow-lime-500/10"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageModalView;
