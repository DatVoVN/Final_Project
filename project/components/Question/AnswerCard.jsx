// File: components/Question/AnswerCard.jsx
"use client";
import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
import toast from "react-hot-toast";
const formatDate = (dateString) => {
  if (!dateString) return "Không rõ";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AnswerCard = ({ answer, questionId, onUpdated }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(answer.content);

  useEffect(() => {
    const check = async () => {
      try {
        const token = Cookies.get("authToken");
        const res = await fetch(
          `${BASE_URL}/api/v1/question/${questionId}/answers/${answer._id}/is-mine`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.isOwner) setIsOwner(true);
      } catch (err) {
        console.error("Failed to check answer ownership", err);
      }
    };
    check();
  }, [answer._id, questionId]);

  const handleUpdate = async () => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch(
        `${BASE_URL}/api/v1/question/${questionId}/answers/${answer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editedContent }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        onUpdated(updated);
        setEditing(false);
      } else {
        alert("Không thể cập nhật câu trả lời");
      }
    } catch (err) {
      console.error("Lỗi cập nhật", err);
    }
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="text-sm text-white">
          <p>Bạn có chắc chắn muốn xóa câu trả lời này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  const token = Cookies.get("authToken");
                  const res = await fetch(
                    `${BASE_URL}/api/v1/question/${questionId}/answers/${answer._id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (res.ok) {
                    const updated = await res.json();
                    if (onUpdated) onUpdated(updated);
                    toast.success("Đã xóa câu trả lời");
                  } else {
                    toast.error("Xóa câu trả lời thất bại");
                  }
                } catch (error) {
                  toast.error("Đã xảy ra lỗi khi xóa");
                  console.error("Lỗi khi xóa:", error);
                } finally {
                  toast.dismiss(t.id);
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-500"
            >
              Xóa
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: "#1e1e1e",
          color: "#fff",
        },
      }
    );
  };

  const avatarUrl = answer.candidate?.avatarUrl
    ? `${answer.candidate.avatarUrl}`
    : null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-10 h-10 text-gray-400" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            {answer.candidate?.fullName || "Ẩn danh"}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Trả lời lúc {formatDate(answer.createdAt)}
          </p>
          {editing ? (
            <>
              <textarea
                className="w-full p-2 border rounded mb-2"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="text-white bg-indigo-600 px-4 py-1 rounded flex items-center"
                >
                  <FaSave className="mr-1" /> Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-gray-600 bg-gray-200 px-4 py-1 rounded flex items-center"
                >
                  <FaTimes className="mr-1" /> Hủy
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-800 text-sm mb-2 whitespace-pre-wrap">
              {answer.content}
            </p>
          )}
          {isOwner && !editing && (
            <div className="flex gap-4 text-sm text-indigo-600 mt-4">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center"
              >
                <FaEdit className="mr-1" /> Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center text-red-500"
              >
                <FaTrashAlt className="mr-1" /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
