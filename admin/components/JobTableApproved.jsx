"use client";
import React, { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import JobDetailModal from "./JobDetailModal";
import ConfirmModal from "./ConfirmModal";
import BASE_URL from "@/utils/config";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const JobTableApproved = ({ jobs, onReload }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    jobId: null,
    action: "",
  });

  const token = Cookies.get("adminToken");

  const openModal = async (jobId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/admin/jobs/${jobId}`);
      const data = await res.json();
      setSelectedJob(data.job);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin job:", error);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  const handleRejectClick = (jobId) => {
    setSelectedJob({ _id: jobId });
    setIsRejectModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!token || !confirmModal.jobId) return;

    if (confirmModal.action === "approve") {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/admin/jobs/approve/${confirmModal.jobId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (res.ok) {
          toast.success("Bài đăng đã được duyệt.");
          window.location.reload();
        } else toast.error(data.message);
      } catch (error) {
        toast.error("Lỗi khi duyệt bài.");
      }
    }
    setConfirmModal({ isOpen: false, jobId: null, action: "" });
  };

  const sendRejectReason = async () => {
    if (!token) return toast.error("Không tìm thấy token.");
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/admin/jobs/reject/${selectedJob._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Từ chối bài và đã gửi email.");
        window.location.reload();
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Lỗi khi gửi lý do.");
    }
    setIsRejectModalOpen(false);
    setRejectReason("");
    setSelectedJob(null);
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, jobId: null, action: "" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!jobs || jobs.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        Không có bài đăng tuyển dụng nào.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-8 border-white border">
        <table className="w-full text-sm text-left text-gray-300 border-white border">
          <thead className="text-xs text-gray-100 uppercase">
            <tr>
              <th className="px-6 py-3">Tiêu đề</th>
              <th className="px-6 py-3">Công ty</th>
              <th className="px-6 py-3">Ngày đăng</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job._id}
                className="border-b border-white hover:bg-gray-700/50"
              >
                <td className="px-6 py-4 text-gray-50 font-medium whitespace-nowrap">
                  {job.title}
                </td>
                <td className="px-6 py-4">{job.company?.name || "N/A"}</td>
                <td className="px-6 py-4">{formatDate(job.createdAt)}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        jobId: job._id,
                        action: "approve",
                      })
                    }
                    className="p-1.5 rounded-full text-green-400 hover:bg-green-700 hover:text-white"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleRejectClick(job._id)}
                    className="p-1.5 rounded-full text-red-400 hover:bg-red-700 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={() => openModal(job._id)}
                    className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <JobDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        job={selectedJob}
      />

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Lý do từ chối bài đăng
            </h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full border rounded-md p-2 text-gray-800"
              placeholder="Nhập lý do từ chối..."
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                  setSelectedJob(null);
                }}
                className="px-4 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={sendRejectReason}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        message="Bạn có chắc muốn DUYỆT bài đăng này?"
      />
    </>
  );
};

export default JobTableApproved;
