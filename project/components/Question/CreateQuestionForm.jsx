"use client";
import React, { useState } from "react";
import { FaQuestionCircle, FaPaperPlane, FaSpinner } from "react-icons/fa";
import Cookies from "js-cookie";
async function createQuestionApi(content) {
  const token = Cookies.get("authToken");
  const response = await fetch("http://localhost:8000/api/v1/question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Không thể tạo câu hỏi");
  }
  return response.json();
}

const CreateQuestionForm = ({ onQuestionCreated }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Nội dung câu hỏi không được để trống.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    try {
      const newQuestion = await createQuestionApi(content);
      setContent("");
      setSuccessMessage("Câu hỏi của bạn đã được gửi thành công!");
      if (onQuestionCreated) {
        onQuestionCreated(newQuestion);
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-indigo-100">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
        <FaQuestionCircle className="mr-3 text-indigo-600" />
        Đặt Câu Hỏi Mới
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="questionContent" className="sr-only">
            Nội dung câu hỏi
          </label>
          <textarea
            id="questionContent"
            rows="4"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
              if (successMessage) setSuccessMessage("");
            }}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm placeholder-gray-400"
            placeholder="Nhập nội dung câu hỏi của bạn ở đây..."
            disabled={isLoading}
          ></textarea>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            {successMessage}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Đang gửi...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" /> Gửi Câu Hỏi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestionForm;
