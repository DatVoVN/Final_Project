import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  FileText,
  CalendarDays,
  BadgeDollarSign,
  ListOrdered,
  Clock,
} from "lucide-react";
import BASE_URL from "@/utils/config";
// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const PackageModalAdd = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: "",
    label: "",
    description: "",
    posts: "",
    priceVND: "",
    duration: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, label, posts, priceVND, duration } = form;

    if (!name || !label || !posts || !priceVND || !duration) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const token = Cookies.get("adminToken");

      const res = await fetch(`${BASE_URL}/api/v1/admin/package`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Không thể tạo gói.");
      }

      onCreated();
      onClose();
      setForm({
        name: "",
        label: "",
        description: "",
        posts: "",
        priceVND: "",
        duration: "",
      });
      setError("");
    } catch (err) {
      console.error("Lỗi khi tạo gói:", err.message);
      setError("Không thể tạo gói. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-lime-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
              THÊM GÓI MỚI
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

        <div className="p-5 max-h-[70vh] overflow-y-auto styled-scrollbar space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center mb-3">
              <div className="h-0.5 w-8 bg-gradient-to-r from-green-500 to-lime-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Thông tin gói
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">Mã gói</label>
                <input
                  name="name"
                  placeholder="VD: basic"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">
                  Tên hiển thị
                </label>
                <input
                  name="label"
                  placeholder="VD: Gói Cơ Bản"
                  value={form.label}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm text-slate-400 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  placeholder="Mô tả chi tiết..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">
                  Số lượt đăng
                </label>
                <input
                  name="posts"
                  type="number"
                  placeholder="VD: 10"
                  value={form.posts}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">
                  Thời hạn (ngày)
                </label>
                <input
                  name="duration"
                  type="number"
                  placeholder="VD: 30"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-400 mb-1">Giá (VNĐ)</label>
                <input
                  name="priceVND"
                  type="number"
                  placeholder="VD: 100000"
                  value={form.priceVND}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-slate-750 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
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
              Tạo gói
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageModalAdd;
