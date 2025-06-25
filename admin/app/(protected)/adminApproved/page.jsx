"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Paginations";
import { motion } from "framer-motion";
import JobTableApproved from "@/components/JobTableApproved";

const AdminJobApprovalPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    jobId: null,
    action: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("adminToken");
        const res = await fetch(
          `${BASE_URL}/api/v1/admin/jobs/pending?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Không thể lấy danh sách bài tuyển dụng");

        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách việc làm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingJobs();
  }, [currentPage]);

  const openConfirmModal = (jobId, action) => {
    setConfirmModal({ isOpen: true, jobId, action });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, jobId: null, action: "" });
  };

  const handleConfirmAction = async () => {
    const { jobId, action } = confirmModal;
    try {
      const token = Cookies.get("adminToken");
      const url = `${BASE_URL}/api/v1/admin/jobs/${action}/${jobId}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`${action} thất bại`);

      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      console.error(`Lỗi khi ${action} bài đăng:`, err);
    } finally {
      closeConfirmModal();
    }
  };

  const handleApprove = (jobId) => openConfirmModal(jobId, "approve");
  const handleReject = (jobId) => openConfirmModal(jobId, "reject");
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">
            Danh sách việc làm đang chờ duyệt
          </h2>

          {loading ? (
            <div className="text-white py-10 text-center text-lg">
              Đang tải dữ liệu...
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Không có dữ liệu bài đăng nào cần duyệt.
            </p>
          ) : (
            <>
              <JobTableApproved
                jobs={jobs}
                onApprove={handleApprove}
                onReject={handleReject}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </motion.div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        message={
          confirmModal.action === "approve"
            ? "Bạn có chắc muốn DUYỆT bài đăng này?"
            : "Bạn có chắc muốn TỪ CHỐI bài đăng này?"
        }
      />
    </div>
  );
};

export default AdminJobApprovalPage;
