"use client";
import React from "react";
import { Eye, Trash } from "lucide-react";

const DeveloperTable = ({ developers, onViewCompany, onDelete }) => {
  if (!developers || developers.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        Không có dữ liệu developer.
      </p>
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
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Họ và Tên</th>
            <th className="px-6 py-3">Số điện thoại</th>
            <th className="px-6 py-3">Ngày tạo</th>
            <th className="px-6 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {developers.map((dev) => (
            <tr
              key={dev._id}
              className="border-b border-white hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td className="px-6 py-4 font-medium text-gray-50 whitespace-nowrap">
                {dev.email}
              </td>
              <td className="px-6 py-4">{dev.fullName}</td>
              <td className="px-6 py-4">{dev.phoneNumber}</td>
              <td className="px-6 py-4">{formatDate(dev.createdAt)}</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button
                  onClick={() => onViewCompany && onViewCompany(dev)}
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Xem công ty"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onDelete && onDelete(dev._id)}
                  className="p-1.5 rounded-full text-red-400 hover:bg-red-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Xóa developer"
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

export default DeveloperTable;
