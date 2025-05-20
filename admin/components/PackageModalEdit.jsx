import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const PackageModalEdit = ({
  isOpen,
  onClose,
  packages,
  onUpdate,
  packageId,
}) => {
  const [form, setForm] = useState({
    label: "",
    description: "",
    posts: "",
    priceVND: "",
    duration: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (packages) {
      setForm({
        label: packages.label || "",
        description: packages.description || "",
        posts: packages.posts || "",
        priceVND: packages.priceVND || "",
        duration: packages.duration || "",
      });
    }
  }, [packages]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { label, posts, priceVND, duration } = form;

    if (!label || !posts || !priceVND || !duration) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const token = Cookies.get("adminToken");
      await axios.put(
        `http://localhost:8000/api/v1/admin/package/${packageId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdate();
      onClose();
      setError("");
    } catch (err) {
      console.error("Lỗi khi cập nhật gói:", err.response?.data || err.message);
      setError("Không thể cập nhật gói. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl border border-slate-700/80">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Chỉnh sửa Gói</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto styled-scrollbar">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input
            name="label"
            placeholder="Tên hiển thị"
            value={form.label}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
          />
          <textarea
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
          />
          <input
            name="posts"
            type="number"
            placeholder="Số lượt đăng"
            value={form.posts}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
          />
          <input
            name="priceVND"
            type="number"
            placeholder="Giá (VND)"
            value={form.priceVND}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
          />
          <input
            name="duration"
            type="number"
            placeholder="Thời hạn (ngày)"
            value={form.duration}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
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
            className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageModalEdit;
