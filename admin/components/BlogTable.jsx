"use client";
import React from "react";
import { Eye, Pencil, Trash } from "lucide-react";
import BASE_URL from "@/utils/config";
// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const BlogTable = ({ blogs, onView, onEdit, onDelete }) => {
  if (!blogs || blogs.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Không có bài blog nào.</p>
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
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-white">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-white uppercase">
          <tr>
            <th className="px-4 py-3">Ảnh</th>
            <th className="px-4 py-3">Tiêu đề</th>
            <th className="px-4 py-3">Trích đoạn</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr
              key={blog._id}
              className="border-b border-white hover:bg-gray-700/40 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <img
                  src={
                    blog.imageUrl?.startsWith("http")
                      ? blog.imageUrl
                      : `${BASE_URL}${blog.imageUrl}`
                  }
                  alt={blog.title}
                  className="w-14 h-14 object-cover rounded"
                />
              </td>
              <td className="px-4 py-3 font-medium text-white">{blog.title}</td>
              <td className="px-4 py-3 max-w-xs truncate">{blog.excerpt}</td>
              <td className="px-4 py-3">{formatDate(blog.createdAt)}</td>
              <td className="px-4 py-3 text-center space-x-2">
                <button
                  onClick={() => onView?.(blog)}
                  title="Xem chi tiết"
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onEdit?.(blog)}
                  title="Sửa blog"
                  className="p-1.5 rounded-full text-yellow-400 hover:bg-yellow-600 hover:text-white transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => onDelete?.(blog._id)}
                  title="Xóa blog"
                  className="p-1.5 rounded-full text-red-400 hover:bg-red-700 hover:text-white transition"
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

export default BlogTable;
