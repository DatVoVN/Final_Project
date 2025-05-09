import React from "react";
import { FileText, CalendarDays } from "lucide-react";

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

const BlogModalView = ({ isOpen, onClose, blog }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700/80">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Chi tiết Blog
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto styled-scrollbar space-y-3">
          <InfoRow icon={FileText} label="Tiêu đề" value={blog?.title} />
          <InfoRow
            icon={CalendarDays}
            label="Ngày tạo"
            value={new Date(blog?.createdAt).toLocaleString()}
          />
          <div className="text-slate-300 leading-relaxed">
            <h3 className="font-semibold text-white mb-2">Nội dung:</h3>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: blog?.content || "<p>Không có nội dung.</p>",
              }}
            />
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

export default BlogModalView;
