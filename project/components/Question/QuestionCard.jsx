"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaRegCommentDots,
  FaUserCircle,
  FaClock,
  FaTrashAlt,
} from "react-icons/fa";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
import toast from "react-hot-toast";
const formatDate = (dateString) => {
  if (!dateString) return "Không rõ";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const QuestionCard = ({ question, onDeleted, isLast }) => {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      try {
        const token = Cookies.get("authToken");
        const res = await fetch(
          `${BASE_URL}/api/v1/question/${question._id}/is-mine`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setIsOwner(data.isOwner);
        }
      } catch (err) {
        console.error("Error checking ownership:", err);
      }
    };

    checkOwner();
  }, [question]);

  const handleDelete = (questionId) => {
    toast(
      (t) => (
        <div className="text-sm text-white">
          <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  const token = Cookies.get("authToken");
                  const res = await fetch(
                    `${BASE_URL}/api/v1/question/${questionId}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (res.ok) {
                    if (onDeleted) onDeleted(questionId);
                    toast.success("Đã xóa câu hỏi");
                  } else {
                    toast.error("Xóa câu hỏi thất bại");
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

  if (!question) return null;

  const candidateName = question.candidate?.fullName || "Ẩn danh";
  const candidateAvatar = question.candidate?.avatarUrl
    ? `${BASE_URL}${question.candidate.avatarUrl}`
    : null;

  return (
    <Link href={`/forum/${question._id}`} legacyBehavior>
      <a
        className={`block bg-white p-6 ${
          !isLast ? "mb-2" : ""
        } rounded-xl shadow-lg hover:shadow-xl transition-all group border border-transparent hover:border-indigo-300 transform hover:-translate-y-1 relative`}
      >
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleDelete(question._id);
            }}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
            title="Xóa câu hỏi"
          >
            <FaTrashAlt />
          </button>
        )}

        <div className="flex items-start space-x-4 mb-4">
          {candidateAvatar ? (
            <Image
              src={candidateAvatar}
              alt={candidateName}
              width={48}
              height={48}
              className="rounded-full object-cover border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors"
            />
          ) : (
            <FaUserCircle className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          )}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">
              {question.content}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Bởi{" "}
              <span className="font-medium text-indigo-600">
                {candidateName}
              </span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <FaClock className="mr-1.5 text-gray-400" />
            <span>{formatDate(question.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <FaRegCommentDots className="mr-1.5 text-indigo-500" />
            <span>{question.answers?.length || 0} trả lời</span>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default QuestionCard;
