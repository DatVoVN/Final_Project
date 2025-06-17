"use client";
import React from "react";
import { Eye, Trash } from "lucide-react";
import BASE_URL from "@/utils/config";

const QuestionTable = ({ questions, onView, onDelete }) => {
  if (!questions || questions.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Không có câu hỏi nào.</p>
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
            <th className="px-4 py-3">Ứng viên</th>
            <th className="px-4 py-3">Nội dung câu hỏi</th>
            <th className="px-4 py-3">Số câu trả lời</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr
              key={q._id}
              className="border-b border-white hover:bg-gray-700/40 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2">
                <img
                  src={
                    q.candidate.avatarUrl?.startsWith("http")
                      ? q.candidate.avatarUrl
                      : `${q.candidate.avatarUrl}`
                  }
                  alt={q.candidate.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-white">{q.candidate.fullName}</span>
              </td>
              <td className="px-4 py-3 max-w-md truncate">{q.content}</td>
              <td className="px-4 py-3 text-center">{q.answers.length}</td>
              <td className="px-4 py-3">{formatDate(q.createdAt)}</td>
              <td className="px-4 py-3 text-center space-x-2">
                <button
                  onClick={() => onView?.(q)}
                  title="Xem chi tiết"
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onDelete?.(q._id)}
                  title="Xóa câu hỏi"
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

export default QuestionTable;
