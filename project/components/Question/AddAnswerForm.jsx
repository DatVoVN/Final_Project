// components/Question/AddAnswerForm.jsx
"use client";
import React, { useState } from "react";
import { FaReply, FaPaperPlane, FaSpinner } from "react-icons/fa";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
async function addAnswerApi(questionId, content) {
  const token = Cookies.get("authToken");
  const response = await fetch(
    `${BASE_URL}/api/v1/question/${questionId}/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "Không thể thêm câu trả lời vì bạn chưa đăng nhập"
    );
  }
  return response.json();
}

const AddAnswerForm = ({ questionId, onAnswerAdded }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Nội dung câu trả lời không được để trống.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    try {
      const updatedQuestion = await addAnswerApi(questionId, content);
      setContent("");
      setSuccessMessage("Câu trả lời của bạn đã được gửi!");
      if (onAnswerAdded) {
        onAnswerAdded(updatedQuestion);
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8 border border-indigo-100">
      <h3 className="text-xl font-semibold text-slate-700 mb-5 flex items-center">
        <FaReply className="mr-2 text-indigo-600" />
        Gửi Câu Trả Lời Của Bạn
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="answerContent" className="sr-only">
            Nội dung câu trả lời
          </label>
          <textarea
            id="answerContent"
            rows="3"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
              if (successMessage) setSuccessMessage("");
            }}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm placeholder-gray-400"
            placeholder="Viết câu trả lời của bạn..."
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
            className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Đang gửi...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" /> Gửi Trả Lời
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAnswerForm;
