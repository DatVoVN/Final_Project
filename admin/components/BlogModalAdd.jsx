import React, { useState } from "react";
import axios from "axios";
import slugify from "slugify";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
const BlogModalAdd = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  // const BASE_URL =
  //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.excerpt || !imageFile) {
      setError("Vui lòng nhập đầy đủ thông tin và chọn ảnh");
      return;
    }

    setError("");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("excerpt", form.excerpt);
    formData.append("slug", slugify(form.title, { lower: true, strict: true }));
    formData.append("image", imageFile);

    try {
      const token = Cookies.get("adminToken");
      await axios.post(`${BASE_URL}/api/v1/blog`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setForm({ title: "", content: "", excerpt: "" });
      setImageFile(null);
      setError("");

      onCreated();
      onClose();
    } catch (err) {
      console.error("Lỗi khi tạo blog:", err.response?.data || err.message);
      setError("Không thể tạo blog. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-lime-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
              THÊM BLOG MỚI
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
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-0.5 w-8 bg-gradient-to-r from-green-500 to-lime-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Thông tin bài viết
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">
                  Tiêu đề bài viết
                </label>
                <input
                  name="title"
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  name="excerpt"
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  placeholder="Mô tả ngắn gọn nội dung..."
                  rows="2"
                  value={form.excerpt}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-0.5 w-8 bg-gradient-to-r from-green-500 to-lime-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Nội dung chính
              </h3>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-400 mb-1">
                Nội dung bài viết
              </label>
              <textarea
                name="content"
                className="w-full min-h-[200px] p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                placeholder="Viết nội dung đầy đủ tại đây..."
                value={form.content}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-0.5 w-8 bg-gradient-to-r from-green-500 to-lime-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Hình ảnh đại diện
              </h3>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-400 mb-1">
                Chọn ảnh từ máy tính
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
                <div className="p-4 rounded-lg bg-slate-750 border border-slate-700 border-dashed flex flex-col items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-lime-500 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="text-slate-300 text-center">
                    {imageFile
                      ? imageFile.name
                      : "Kéo thả ảnh hoặc nhấn để chọn"}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    PNG, JPG, JPEG (tối đa 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 text-center">
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl text-white font-medium border border-slate-600 shadow-lg transition-all duration-300"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 rounded-xl text-white font-medium border border-lime-500/50 shadow-lg shadow-lime-500/10 transition-all duration-300"
            >
              Đăng bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogModalAdd;
