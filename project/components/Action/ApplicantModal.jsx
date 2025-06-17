import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  HiX,
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import BASE_URL from "@/utils/config";
const ApplicantModal = ({ jobId, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [actionType, setActionType] = useState("");
  const [note, setNote] = useState("");
  const [actionModalOpen, setActionModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      const token = Cookies.get("token");
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Không tìm thấy token xác thực.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/developer/job/${jobId}/applicants`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ message: "Lỗi không xác định" }));
          throw new Error(
            `Lỗi ${res.status}: ${errorData.message || res.statusText}`
          );
        }

        const data = await res.json();
        setApplicants(data.applicants || []);
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
        setError(error.message || "Không thể tải danh sách ứng viên.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchApplicants();
  }, [jobId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openActionModal = (applicantId, type) => {
    setSelectedApplicant(applicantId);
    setActionType(type);
    setNote("");
    setActionModalOpen(true);
  };

  const handleSubmitAction = async () => {
    const token = Cookies.get("token");
    if (!token || !selectedApplicant || !jobId || !actionType) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/developer/jobs/${jobId}/applicants/${selectedApplicant}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: actionType, note }),
        }
      );

      if (!res.ok) throw new Error("Lỗi khi cập nhật trạng thái ứng viên");
      setApplicants((prev) =>
        prev.filter((app) => app._id !== selectedApplicant)
      );
      setActionModalOpen(false);
    } catch (error) {
      alert(error.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-appear">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách ứng viên
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="ml-3 text-gray-600">Đang tải danh sách...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 font-medium">Lỗi</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-sm font-medium text-gray-900">
                Chưa có ứng viên
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Hiện tại chưa có ai ứng tuyển.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ảnh
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ứng tuyển
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    CV
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicants.map(({ candidate, _id, appliedAt }) => (
                  <tr key={_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {candidate?.avatarUrl && (
                        <img
                          src={`${candidate.avatarUrl}`}
                          alt="avatar"
                          width={40}
                          height={40}
                          className="rounded-full object-cover border shadow-sm"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {candidate.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {candidate.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(appliedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {candidate.cvUrl ? (
                        <a
                          href={`${candidate.cvUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                        >
                          <HiOutlineDocumentText className="w-4 h-4" />
                          Xem CV
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                          Không có CV
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openActionModal(_id, "approve")}
                        title="Thông qua"
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <HiOutlineCheck className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openActionModal(_id, "reject")}
                        title="Loại"
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <HiOutlineX className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action modal */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50  bg-opacity-30 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-xl w-full max-w-xl shadow-2xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {actionType === "approve"
                ? "Xác nhận duyệt ứng viên?"
                : "Xác nhận loại ứng viên?"}
            </h3>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (tùy chọn)..."
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={() => setActionModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAction}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ApplicantModal;
