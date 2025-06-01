import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import slugify from "slugify";
import { FileText, Image as ImageIcon, X } from "lucide-react";

const BlogModalEdit = ({ isOpen, onClose, blog, onUpdate, blogId }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        slug: blog.slug || "",
        imageUrl: blog.imageUrl || "",
      });
      setImageFile(null);
    }
  }, [blog]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.excerpt) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("excerpt", form.excerpt);
    formData.append(
      "slug",
      form.slug || slugify(form.title, { lower: true, strict: true })
    );
    if (imageFile) formData.append("image", imageFile);

    try {
      const token = Cookies.get("adminToken");

      const res = await fetch(`${BASE_URL}/api/v1/blog/${blogId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Cập nhật thất bại.");
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật blog:", err.message);
      setError("Có lỗi khi cập nhật blog. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-400 mr-2" />
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Chỉnh sửa Blog
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto styled-scrollbar">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Tiêu đề *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề blog"
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Mô tả ngắn *
              </label>
              <textarea
                name="excerpt"
                rows="2"
                value={form.excerpt}
                onChange={handleChange}
                placeholder="Tóm tắt nội dung"
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Nội dung *
              </label>
              <textarea
                name="content"
                rows="6"
                value={form.content}
                onChange={handleChange}
                placeholder="Nội dung bài viết"
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {form.imageUrl && !imageFile && (
              <div>
                <p className="text-sm text-slate-400">Ảnh hiện tại:</p>
                <img
                  src={`${BASE_URL}${form.imageUrl}`}
                  alt="Current Blog"
                  className="w-full max-h-60 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-400" />
                Ảnh bìa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 file:text-white file:bg-slate-600 file:mr-3 file:p-2"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogModalEdit;
