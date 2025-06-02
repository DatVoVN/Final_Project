"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import AnswerCard from "@/components/Question/AnswerCard";
import AddAnswerForm from "@/components/Question/AddAnswerForm";
import {
  FaUserCircle,
  FaClock,
  FaComments,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
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

async function fetchQuestionByIdApi(id) {
  const response = await fetch(`${BASE_URL}/api/v1/question/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Câu hỏi không tồn tại");
    throw new Error("Không thể tải chi tiết câu hỏi");
  }
  return response.json();
}

async function checkOwnership(id) {
  const token = Cookies.get("authToken");
  const res = await fetch(`${BASE_URL}/api/v1/question/${id}/is-mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.isOwner;
}

async function updateQuestion(id, newContent) {
  const token = Cookies.get("authToken");
  const res = await fetch(`${BASE_URL}/api/v1/question/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: newContent }),
  });
  return res.json();
}

const QuestionDetailPage = () => {
  const params = useParams();
  const questionId = params.id;

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const loadQuestionDetail = useCallback(async () => {
    if (!questionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestionByIdApi(questionId);
      setQuestion(data);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải chi tiết câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadQuestionDetail();
    if (questionId) {
      checkOwnership(questionId).then(setIsOwner).catch(console.error);
    }
  }, [loadQuestionDetail, questionId]);

  const handleAnswerAdded = (updatedQuestion) => {
    setQuestion(updatedQuestion);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 py-12">
        <FaSpinner className="animate-spin text-indigo-600 text-5xl mb-4" />
        <p className="text-lg text-gray-700">Đang tải chi tiết câu hỏi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 p-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
        <p className="text-xl font-semibold text-red-700">Lỗi!</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/questions" legacyBehavior>
          <a className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            <FaArrowLeft className="mr-2" /> Quay lại danh sách
          </a>
        </Link>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-20 text-xl text-gray-500">
        Không tìm thấy câu hỏi.
      </div>
    );
  }

  const candidateName = question.candidate?.fullName || "Ẩn danh";
  const candidateAvatar = question.candidate?.avatarUrl
    ? `${BASE_URL}${question.candidate.avatarUrl}`
    : null;

  return (
    <div className="min-h-screen bg-slate-100 antialiased">
      <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-black py-12 sm:py-14 md:py-16 text-white shadow-2xl overflow-hidden relative">
        <img
          src="/YouEngage_best_poll_questions.png"
          alt="Hỏi đáp kiến thức"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FaComments className="mx-auto text-5xl sm:text-6xl text-indigo-400 mb-6 drop-shadow-lg" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter drop-shadow-md">
            Diễn Đàn Hỏi Đáp
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 mt-2">
              Cộng Đồng IT Việt
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Đặt câu hỏi, chia sẻ kiến thức, và cùng nhau giải quyết các vấn đề
            trong lĩnh vực công nghệ thông tin.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-10 sm:py-12 md:py-16">
        <div className="mb-8">
          <Link href="/forum" legacyBehavior>
            <a className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium group">
              <FaArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
              Trở về danh sách câu hỏi
            </a>
          </Link>
        </div>

        <article className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 border border-indigo-200">
          <header className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 mb-4">
                {candidateAvatar ? (
                  <Image
                    src={candidateAvatar}
                    alt={candidateName}
                    width={56}
                    height={56}
                    className="rounded-full object-cover border-2 border-indigo-200"
                  />
                ) : (
                  <FaUserCircle className="w-14 h-14 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-indigo-700">
                    {candidateName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <FaClock className="mr-1 text-gray-400" />
                    Đã hỏi vào {formatDate(question.createdAt)}
                  </p>
                </div>
              </div>
              {isOwner && !isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditContent(question.content);
                  }}
                  className="text-sm text-indigo-600 hover:underline flex items-center"
                >
                  <FaEdit className="mr-1" /> Chỉnh sửa
                </button>
              )}
            </div>

            {isEditing ? (
              <>
                <textarea
                  className="w-full mt-4 p-4 text-base border rounded-md focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-4 mt-3">
                  <button
                    onClick={async () => {
                      try {
                        const updated = await updateQuestion(
                          questionId,
                          editContent
                        );
                        setQuestion(updated);
                        setIsEditing(false);
                      } catch (err) {
                        alert("Lỗi khi cập nhật câu hỏi.");
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <FaSave className="mr-2" /> Lưu
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    <FaTimes className="mr-2" /> Hủy
                  </button>
                </div>
              </>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                {question.content}
              </h1>
            )}
          </header>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-6 flex items-center">
              <FaComments className="mr-3 text-indigo-600" />
              {question.answers?.length > 0
                ? `${question.answers.length} Câu Trả Lời`
                : "Chưa Có Câu Trả Lời"}
            </h2>
            {question.answers && question.answers.length > 0 ? (
              <div className="space-y-6">
                {question.answers
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((answer) => (
                    <AnswerCard
                      key={answer._id}
                      answer={answer}
                      questionId={question._id}
                      onUpdated={setQuestion}
                    />
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-slate-50 p-4 rounded-md">
                Hãy là người đầu tiên trả lời câu hỏi này!
              </p>
            )}
          </section>
        </article>

        <AddAnswerForm
          questionId={question._id}
          onAnswerAdded={handleAnswerAdded}
        />
      </div>
    </div>
  );
};

export default QuestionDetailPage;
