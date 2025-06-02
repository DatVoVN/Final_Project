import React, { useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineTrash,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import EditJobFormModal from "../Action/EditJobFormModal";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const JobTableRow = ({
  job,
  getStatus,
  onViewApplicants,
  refetchJobs,
  setEditingJob,
  onViewDetail,
}) => {
  const [isActive, setIsActive] = useState(job.isActive);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = Cookies.get("token");
  const statusInfo = getStatus(isActive, job.deadline);
  const handleToggleActive = async () => {
    setIsLoading(true);
    const url = isActive
      ? `${BASE_URL}/api/v1/developer/jobs/${job._id}/deactivate`
      : `${BASE_URL}/api/v1/developer/jobs/${job._id}/reactivate`;
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Không thể thay đổi trạng thái công việc."
        );
      }
      setIsActive(data.job.isActive);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    toast.custom((t) => (
      <div className="bg-white shadow-md rounded-lg px-4 py-3 border border-gray-200 max-w-sm">
        <p className="text-sm font-medium text-gray-900">
          Bạn có chắc chắn muốn xóa công việc này?
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setIsLoading(true);
              try {
                const response = await fetch(
                  `{BASE_URL}/api/v1/developer/jobs/${job._id}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                const data = await response.json();
                if (!response.ok) {
                  throw new Error(data.message || "Không thể xóa công việc.");
                }
                toast.success("Đã xóa công việc.");
                window.location.reload();
              } catch (err) {
                setError(err.message);
                toast.error("Lỗi khi xóa công việc.");
              } finally {
                setIsLoading(false);
              }
            }}
            className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Xóa
          </button>
        </div>
      </div>
    ));
  };
  return (
    <>
      <tr className="hover:bg-gray-50 align-top">
        <td className="px-4 py-4 max-w-xs">
          <p className="block truncate ">{job.title}</p>
          <div className="text-xs text-gray-500">ID: {job._id}</div>
          <div className="text-xs text-gray-500">
            Đăng ngày: {formatDate(job.createdAt)}
          </div>
        </td>
        <td className="px-4 py-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </td>
        <td className="px-4 py-4 text-sm text-gray-500">
          {formatDate(job.deadline)}
        </td>
        <td className="px-4 py-4 text-center">
          {job.applicants?.filter((applicant) => applicant.status === "pending")
            .length || 0}
        </td>
        <td className="px-4 py-4 text-center">
          <div className="flex justify-center items-center gap-2">
            <button
              title="Xem thông tin công việc"
              className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
              onClick={() => onViewDetail(job._id)}
            >
              <HiOutlineInformationCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewApplicants(job._id)}
              title="Xem ứng viên"
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            >
              <HiOutlineEye className="h-5 w-5" />
            </button>
            <button
              title="Chỉnh sửa"
              className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
              onClick={() => setEditingJob(job)}
            >
              <HiOutlinePencilAlt className="h-5 w-5" />
            </button>
            <button
              onClick={handleToggleActive}
              title={isActive ? "Tạm ẩn" : "Hiển thị lại"}
              className={`p-1 ${
                isActive
                  ? "text-gray-500 hover:bg-gray-100"
                  : "text-green-600 hover:bg-green-100"
              } rounded`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : isActive ? (
                <HiOutlinePause className="h-5 w-5" />
              ) : (
                <HiOutlinePlay className="h-5 w-5" />
              )}
            </button>
            <button
              title="Xóa"
              onClick={handleDelete}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              disabled={isLoading}
            >
              <HiOutlineTrash className="h-5 w-5" />
            </button>
          </div>
        </td>
      </tr>
    </>
  );
};

export default JobTableRow;
