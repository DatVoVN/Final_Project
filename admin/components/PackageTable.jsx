"use client";
import React from "react";
import { Eye, Pencil, Trash } from "lucide-react";

const PackageTable = ({ packages, onDelete, onEdit, onView }) => {
  console.log(packages);

  if (!packages || packages.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Không có dữ liệu gói.</p>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-8 border-white border">
      <table className="w-full text-sm text-left text-gray-300 border-white border">
        <thead className="text-xs text-gray-100 uppercase">
          <tr>
            <th className="px-6 py-3">Label</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Số tin đăng</th>
            <th className="px-6 py-3">Giá</th>
            <th className="px-6 py-3">Ngày được tăng thêm</th>
            <th className="px-6 py-3">Ngày tạo</th>
            <th className="px-6 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((item) => (
            <tr
              key={item._id}
              className="border-b border-white hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td className="px-6 py-4 font-medium text-gray-50 whitespace-nowrap">
                {item.label}
              </td>
              <td className="px-6 py-4">{item.description}</td>
              <td className="px-6 py-4">{item.posts}</td>
              <td className="px-6 py-4">{item.priceVND}</td>
              <td className="px-6 py-4">{item.duration}</td>
              <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button
                  onClick={() => onView && onView(item)}
                  title="Xem chi tiết"
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onEdit && onEdit(item)}
                  title="Sửa gói"
                  className="p-1.5 rounded-full text-yellow-400 hover:bg-yellow-600 hover:text-white transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => onDelete && onDelete(item._id)}
                  className="p-1.5 rounded-full text-red-400 hover:bg-red-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Xóa gói"
                >
                  <Trash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PackageTable;
