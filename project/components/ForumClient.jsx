"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import QuestionCard from "@/components/Question/QuestionCard";
import CreateQuestionForm from "@/components/Question/CreateQuestionForm";
import Pagination from "@/components/Pagination";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaPlusCircle,
  FaComments,
} from "react-icons/fa";
import BASE_URL from "@/utils/config";
async function fetchQuestionsApi(page = 1, limit = 7, mine = false) {
  const token = Cookies.get("authToken");
  const endpoint = mine
    ? `${BASE_URL}/api/v1/question/mine?page=${page}&limit=${limit}`
    : `${BASE_URL}/api/v1/question?page=${page}&limit=${limit}`;
  const response = await fetch(endpoint, {
    headers: mine ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Không thể tải danh sách câu hỏi");
  }
  return response.json();
}

export default function ForumClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questionsData, setQuestionsData] = useState({
    questions: [],
    page: 1,
    totalPages: 1,
    totalQuestions: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(pageParam);
  }, [searchParams]);

  const loadQuestions = useCallback(
    async (pageToLoad) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchQuestionsApi(pageToLoad, 7, showMine);
        setQuestionsData({
          questions: data.questions || [],
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          totalQuestions: data.totalQuestions || 0,
        });
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải câu hỏi.");
        setQuestionsData((prev) => ({ ...prev, questions: [] }));
      } finally {
        setLoading(false);
      }
    },
    [showMine]
  );

  useEffect(() => {
    loadQuestions(currentPage);
  }, [currentPage, loadQuestions]);

  const handlePageChange = (newPage) => {
    router.push(`/forum?page=${newPage}`);
  };

  const handleQuestionCreated = () => {
    setShowCreateForm(false);
    if (currentPage === 1) {
      loadQuestions(1);
    } else {
      router.push("/forum?page=1");
    }
  };

  const handleQuestionDeleted = (deletedId) => {
    setQuestionsData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q._id !== deletedId),
    }));
  };

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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-4">
          <div className="text-slate-700">
            {!loading && questionsData.totalQuestions > 0 && (
              <p className="text-sm font-medium">
                Hiển thị{" "}
                <span className="font-bold">
                  {questionsData.questions.length}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-bold">
                  {questionsData.totalQuestions}
                </span>{" "}
                câu hỏi
              </p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <FaPlusCircle className="mr-2.5 h-5 w-5" />
              {showCreateForm ? "Ẩn Form" : "Đặt Câu Hỏi Mới"}
            </button>
            <button
              onClick={() => {
                setShowMine((prev) => !prev);
                router.push("/forum?page=1");
              }}
              className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg shadow hover:bg-slate-300 transition"
            >
              {showMine ? "Hiển thị tất cả câu hỏi" : "Chỉ xem câu hỏi của tôi"}
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="mb-10 p-6 bg-white rounded-xl shadow-xl border border-slate-200">
            <CreateQuestionForm onQuestionCreated={handleQuestionCreated} />
          </div>
        )}

        {loading && (
          <div className="flex flex-col justify-center items-center min-h-[1000px] py-12 text-center">
            <FaSpinner className="animate-spin text-indigo-500 text-5xl mb-6" />
            <p className="text-lg font-medium text-slate-700">
              Đang tải câu hỏi...
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Vui lòng đợi trong giây lát.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col justify-center items-center min-h-[1000px] py-12 text-center bg-red-50 p-8 rounded-xl shadow-lg border border-red-200">
            <FaExclamationTriangle className="text-red-500 text-5xl mb-6" />
            <p className="text-2xl font-bold text-red-700 mb-2">
              Oops! Đã xảy ra lỗi
            </p>
            <p className="text-slate-600 max-w-md">Bạn cần phải đăng nhập</p>
          </div>
        )}

        {!loading && !error && questionsData.questions.length === 0 && (
          <div className="text-center py-20 bg-white p-10 rounded-xl shadow-lg border border-slate-200 min-h-[1000px]">
            <p className="text-2xl font-bold text-slate-700 mb-2">
              Chưa có câu hỏi nào
            </p>
            <p className="text-slate-500">
              Hãy là người đầu tiên đóng góp cho diễn đàn bằng cách đặt câu hỏi
              của bạn!
            </p>
          </div>
        )}

        {!loading && !error && questionsData.questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {questionsData.questions.map((q, index) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  isLast={index === questionsData.questions.length - 1}
                  onDeleted={handleQuestionDeleted}
                />
              ))}
            </div>
            {questionsData.totalPages > 1 && (
              <div className="p-6 border-t border-slate-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={questionsData.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
