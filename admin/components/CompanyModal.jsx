import React from "react";
import {
  Building,
  MapPin,
  Tag,
  Users,
  Mail,
  CalendarDays,
  FileText,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import BASE_URL from "@/utils/config";
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3 px-4 rounded-lg bg-slate-750 hover:bg-slate-700/60 transition-colors">
    <div className="mr-3 p-2 bg-slate-700 rounded-lg">
      <Icon className="h-5 w-5 text-cyan-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-slate-400 text-sm">{label}</div>
      <div className="mt-1 text-white font-medium text-lg break-words">
        {value || <span className="text-slate-400">N/A</span>}
      </div>
    </div>
  </div>
);
// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const CompanyModalView = ({ isOpen, onClose, company }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              CHI TIẾT CÔNG TY
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

        <div className="p-5 max-h-[70vh] overflow-y-auto styled-scrollbar space-y-5">
          {company ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.avatarUrl && (
                  <div className="flex justify-center mb-4">
                    <div
                      className="
      w-32 h-32
      rounded-full
      overflow-hidden
      border-4 border-white
      shadow-lg
      hover:shadow-xl
      transition-all
      duration-300
      transform hover:-translate-y-1
      relative
    "
                    >
                      <img
                        src={`${company.avatarUrl}`}
                        alt="Company logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.classList.add(
                            "bg-gradient-to-r",
                            "from-blue-50",
                            "to-purple-100"
                          );
                          e.target.classList.add("opacity-0");
                        }}
                      />
                    </div>
                  </div>
                )}

                <InfoRow
                  icon={Building}
                  label="Tên công ty"
                  value={company.name}
                />
                <InfoRow
                  icon={MapPin}
                  label="Địa chỉ"
                  value={company.address}
                />
                <InfoRow
                  icon={Tag}
                  label="Mã số thuế"
                  value={company.taxCode}
                />
                <InfoRow
                  icon={Users}
                  label="Quy mô"
                  value={
                    company.companySize
                      ? `${company.companySize} nhân viên`
                      : null
                  }
                />
                <InfoRow
                  icon={Mail}
                  label="Email công ty"
                  value={company.email}
                />
                {company.workingDays && (
                  <InfoRow
                    icon={CalendarDays}
                    label="Ngày làm việc"
                    value={`Từ ${company.workingDays.from} - ${company.workingDays.to}`}
                  />
                )}
                <InfoRow
                  icon={Clock}
                  label="Chế độ làm thêm"
                  value={company.overtimePolicy}
                />
              </div>

              <div className="mt-5">
                <div className="flex items-center mb-3">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 mr-3"></div>
                  <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Mô tả công ty
                  </h3>
                </div>
                <div className="bg-slate-750 rounded-xl p-4 border border-slate-700">
                  <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                    {company.description || "Không có mô tả công ty."}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center mb-3">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 mr-3"></div>
                  <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Tổng quan về công ty
                  </h3>
                </div>
                <div className="bg-slate-750 rounded-xl p-4 border border-slate-700">
                  <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                    {company.overview || "Không có mô tả công ty."}
                  </p>
                </div>
              </div>
            </>
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
                Không có thông tin công ty.
              </p>
              <p className="text-slate-500 text-sm">
                Vui lòng kiểm tra lại dữ liệu.
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-700 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl text-white font-medium border border-slate-600 shadow-lg transition-all duration-300 hover:shadow-cyan-500/10"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModalView;
