import React, { useState } from "react";
import axios from "axios";
import slugify from "slugify";
import Cookies from "js-cookie";

const BlogModalAdd = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

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
      await axios.post("http://localhost:8000/api/v1/blog", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setForm({ title: "", content: "", excerpt: "" });
      setImageFile(null);
      setError("");

      onCreated(); // Refresh blog list
      onClose(); // Close modal
    } catch (err) {
      console.error("Lỗi khi tạo blog:", err.response?.data || err.message);
      setError("Không thể tạo blog. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700/80">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-500">
            Thêm Blog Mới
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto styled-scrollbar">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input
            name="title"
            className="w-full p-3 rounded bg-slate-700 text-white"
            placeholder="Tiêu đề"
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            name="excerpt"
            className="w-full p-3 rounded bg-slate-700 text-white"
            placeholder="Mô tả ngắn"
            value={form.excerpt}
            onChange={handleChange}
          />
          <textarea
            name="content"
            className="w-full h-40 p-3 rounded bg-slate-700 text-white"
            placeholder="Nội dung"
            value={form.content}
            onChange={handleChange}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full p-3 rounded bg-slate-700 text-white"
            onChange={handleImageChange}
          />
        </div>

        <div className="px-5 py-4 border-t border-slate-700 text-right space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 rounded-lg text-white"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-500"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogModalAdd;
