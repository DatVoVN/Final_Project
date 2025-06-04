"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Pagination from "@/components/Paginations";
import QuestionTable from "@/components/QuestionTable";
import QuestionModalView from "@/components/QuestionModalView";
import BASE_URL from "@/utils/config";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchQuestions = async (page = 1) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/question?page=${page}&limit=5`
      );
      const data = await res.json();

      if (res.ok) {
        setQuestions(data.questions || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || "Lỗi khi tải danh sách câu hỏi");
      }
    } catch (err) {
      console.error("Lỗi gọi API:", err);
      toast.error("Không thể tải dữ liệu câu hỏi");
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleView = (question) => {
    setSelectedQuestion(question);
    setViewModalOpen(true);
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="text-sm text-white">
          <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  const token = Cookies.get("adminToken");
                  const res = await fetch(
                    `${BASE_URL}/api/v1/admin/questions/${id}`,
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  if (!res.ok) throw new Error("Xóa thất bại");

                  toast.success("✅ Xóa câu hỏi thành công");
                  fetchQuestions(currentPage);
                } catch (err) {
                  toast.error("❌ Không thể xóa câu hỏi");
                  console.error(err);
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
        style: { background: "#1e1e1e", color: "#fff" },
      }
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">Danh sách câu hỏi</h1>

      <QuestionTable
        questions={questions}
        onView={handleView}
        onDelete={handleDelete}
      />

      {questions.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <QuestionModalView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        question={selectedQuestion}
      />
    </div>
  );
};

export default QuestionPage;
