"use client";
import React from "react";
import { Eye, Trash } from "lucide-react";
import BASE_URL from "@/utils/config";

const FeedTable = ({ posts, onView, onDelete }) => {
  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Không có bài viết nào.</p>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-white">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-white uppercase">
          <tr>
            <th className="px-4 py-3">Tác giả</th>
            <th className="px-4 py-3">Nội dung</th>
            <th className="px-4 py-3 text-center">Lượt thích</th>
            <th className="px-4 py-3 text-center">Bình luận</th>
            <th className="px-4 py-3">Ngày đăng</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post._id}
              className="border-b border-white hover:bg-gray-700/40 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2">
                <img
                  src={
                    post.author?.avatarUrl?.startsWith("http")
                      ? post.author.avatarUrl
                      : `${post.author?.avatarUrl || "/R.jpg"}`
                  }
                  alt={post.author?.fullName || "Tác giả"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-white">
                  {post.author?.fullName || "Ẩn danh"}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs truncate">{post.content}</td>
              <td className="px-4 py-3 text-center">
                {post.likes?.length || 0}
              </td>
              <td className="px-4 py-3 text-center">
                {post.comments?.length || 0}
              </td>
              <td className="px-4 py-3">{formatDate(post.createdAt)}</td>
              <td className="px-4 py-3 text-center space-x-2">
                <button
                  onClick={() => onView?.(post)}
                  title="Xem chi tiết"
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onDelete?.(post._id)}
                  title="Xóa bài viết"
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

export default FeedTable;
