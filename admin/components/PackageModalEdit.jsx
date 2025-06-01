import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Package,
  FileText,
  ListOrdered,
  BadgeDollarSign,
  Clock,
  X,
} from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

    setIsSubmitting(true);
    setError("");

    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(`${BASE_URL}/api/v1/admin/package/${packageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không thể cập nhật gói.");
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật gói:", err.message);
      setError(err.message || "Không thể cập nhật gói. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl border border-slate-700">
        {/* Header with gradient bar */}
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-400 mr-2" />
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Chỉnh sửa Gói Dịch Vụ
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto styled-scrollbar">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-slate-750 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 text-blue-400 mr-2" />
                <label className="text-sm font-medium text-slate-300">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                name="label"
                placeholder="Nhập tên gói dịch vụ"
                value={form.label}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="bg-slate-750 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 text-blue-400 mr-2" />
                <label className="text-sm font-medium text-slate-300">
                  Mô tả gói
                </label>
              </div>
              <textarea
                name="description"
                placeholder="Nhập mô tả chi tiết về gói dịch vụ"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-750 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center mb-2">
                  <ListOrdered className="h-4 w-4 text-blue-400 mr-2" />
                  <label className="text-sm font-medium text-slate-300">
                    Số lượt đăng <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  name="posts"
                  type="number"
                  placeholder="Số bài đăng"
                  value={form.posts}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="bg-slate-750 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-blue-400 mr-2" />
                  <label className="text-sm font-medium text-slate-300">
                    Thời hạn (ngày) <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  name="duration"
                  type="number"
                  placeholder="Số ngày sử dụng"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="bg-slate-750 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center mb-2">
                <BadgeDollarSign className="h-4 w-4 text-blue-400 mr-2" />
                <label className="text-sm font-medium text-slate-300">
                  Giá (VND) <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  ₫
                </span>
                <input
                  name="priceVND"
                  type="number"
                  placeholder="Nhập giá gói"
                  value={form.priceVND}
                  onChange={handleChange}
                  className="w-full pl-8 p-3 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex justify-between">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 font-medium border border-slate-600 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang lưu...
              </span>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageModalEdit;
