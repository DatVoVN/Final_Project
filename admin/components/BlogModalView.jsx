import React from "react";
import { FileText, CalendarDays, Image as ImageIcon, User } from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3 px-4 rounded-lg bg-slate-750 hover:bg-slate-700/60 transition-colors">
    <div className="mr-3 p-2 bg-slate-700 rounded-lg">
      <Icon className="h-5 w-5 text-cyan-400" />
    </div>
    <div className="flex-1">
      <div className="font-medium text-slate-400 text-sm">{label}</div>
      <div className="mt-1 text-white font-medium text-lg">
        {value || <span className="text-slate-400">N/A</span>}
      </div>
    </div>
  </div>
);

const BlogModalView = ({ isOpen, onClose, blog }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              CHI TIẾT BLOG
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow icon={FileText} label="Tiêu đề" value={blog?.title} />
            <InfoRow
              icon={CalendarDays}
              label="Ngày tạo"
              value={new Date(blog?.createdAt).toLocaleString()}
            />
            <InfoRow
              icon={User}
              label="Tác giả"
              value={blog?.author || "Admin"}
            />
            {blog?.image && (
              <div className="md:col-span-2">
                <div className="flex items-start py-3 px-4 rounded-lg bg-slate-750 hover:bg-slate-700/60 transition-colors">
                  <div className="mr-3 p-2 bg-slate-700 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-400 text-sm mb-2">
                      Hình ảnh đại diện
                    </div>
                    <div className="mt-1">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full max-h-48 object-cover rounded-lg border border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="flex items-center mb-3">
              <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Mô tả ngắn
              </h3>
            </div>
            <div className="bg-slate-750 rounded-xl p-4 border border-slate-700">
              <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                {blog?.excerpt || "Không có mô tả ngắn."}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center mb-3">
              <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Nội dung chính
              </h3>
            </div>
            <div className="bg-slate-750 rounded-xl p-4 border border-slate-700">
              <div
                className="prose prose-invert max-w-none text-slate-200"
                dangerouslySetInnerHTML={{
                  __html: blog?.content || "<p>Không có nội dung.</p>",
                }}
              />
            </div>
          </div>
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

export default BlogModalView;
