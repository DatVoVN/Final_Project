"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";
import { formatSalary, formatDate } from "@/utils/formatters";
import Cookies from "js-cookie";
import {
  FaRegHeart,
  FaPaperPlane,
  FaExclamationTriangle,
  FaBullseye,
  FaTimesCircle,
} from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiCurrencyDollar,
} from "react-icons/hi";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
const JobHeaderCard = ({ job, company, initialAppliedStatus = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasApplied, setHasApplied] = useState(initialAppliedStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const checkIfApplied = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/candidates/check-applied/${job._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        setHasApplied(result.hasApplied);
      } else {
        setError(result.message || "Lỗi kiểm tra trạng thái ứng tuyển.");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi kiểm tra trạng thái.");
    }
  };

  useEffect(() => {
    checkIfApplied();
  }, [job?._id]);

  if (!job || !company) return null;

  const isUnderReview = job.status === "pending";
  const isFirstApplicantOpportunity =
    !job.applicants || job.applicants.length === 0;

  // const handleApply = async () => {
  //   setIsProcessing(true);
  //   setError(null);
  //   setSuccess(null);

  //   const token = Cookies.get("authToken");

  //   if (!token) {
  //     const msg = "Bạn không có quyền ứng tuyển. Vui lòng đăng nhập.";
  //     setError(msg);
  //     setIsProcessing(false);
  //     alert(msg);
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       "http://localhost:8000/api/v1/candidates/apply",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ jobId: job._id }),
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.message || "Nộp hồ sơ thất bại.");
  //     }

  //     setSuccess(result.message || "Nộp hồ sơ thành công!");
  //     setHasApplied(true);

  //     // Optional: alert hoặc toast tùy bạn muốn UI sao
  //   } catch (err) {
  //     console.error("Apply Error:", err);
  //     setError(err.message || "Đã xảy ra lỗi khi nộp hồ sơ.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };
  const handleApply = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const token = Cookies.get("authToken");

    if (!token) {
      const msg = "Bạn không có quyền ứng tuyển. Vui lòng đăng nhập.";
      setError(msg);
      setIsProcessing(false);
      toast.error(msg);
      return;
    }

    try {
      const userResponse = await fetch(`${BASE_URL}/api/v1/candidates/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userResult = await userResponse.json();
      if (!userResponse.ok) {
        throw new Error(
          userResult.message || "Không thể lấy thông tin cá nhân."
        );
      }

      const { fullName, email, phone, cvUrl } = userResult.data;
      setUserData({ fullName, email, phone, cvUrl });
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi nộp hồ sơ.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmApply = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const token = Cookies.get("authToken");

    if (!token) {
      const msg = "Bạn không có quyền ứng tuyển. Vui lòng đăng nhập.";
      setError(msg);
      setIsProcessing(false);
      alert(msg);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/candidates/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job._id }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Nộp hồ sơ thất bại.");
      }

      setSuccess(result.message || "Nộp hồ sơ thành công!");
      setHasApplied(true);
      toast.success("🎉 Ứng tuyển thành công!");
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi nộp hồ sơ.");
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };

  const handleCancelApplyModal = () => {
    setIsModalOpen(false);
  };
  const handleCancelApply = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const token = Cookies.get("authToken");

    if (!token) {
      const msg = "Lỗi xác thực. Vui lòng đăng nhập lại.";
      setError(msg);
      setIsProcessing(false);
      toast.error(msg);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/candidates/unapply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job._id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `Hủy ứng tuyển thất bại (${response.status})`
        );
      }

      setSuccess(result.message || "Đã hủy ứng tuyển thành công!");
      setHasApplied(false);
      toast.success("Hủy ứng tuyển thành công");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi hủy ứng tuyển.");
    } finally {
      setIsProcessing(false);
    }
  };

  const logoSrc = company?.avatarUrl
    ? company.avatarUrl.startsWith("http")
      ? company.avatarUrl
      : `${BASE_URL}/${company.avatarUrl}`
    : "/company.png";

  return (
    <div className="bg-white p-4 md:px-10 py-3 md:py-4 rounded-lg shadow-md border border-gray-100 mb-5">
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
        <div className="shrink-0">
          <ImageWithFallback
            src={logoSrc}
            fallbackSrc="/placeholder-logo.png"
            alt={`${company?.name || "Company"} logo`}
            width={80}
            height={80}
            className="object-contain rounded border border-gray-200"
          />
        </div>
        <div className="flex-grow w-full">
          {company?.name && (
            <Link
              href={`/company/detail/${company._id}`}
              className="text-sm text-gray-600 hover:text-blue-600 mb-1 block"
            >
              {company.name}
            </Link>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {job.title}
          </h1>
          {isUnderReview && (
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full mb-3">
              <FaExclamationTriangle />
              <span>Việc làm này đang được kiểm duyệt</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-700 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-600">
                <HiCurrencyDollar size={14} />
              </span>
              <span>
                Mức lương:{" "}
                <span className="font-semibold text-purple-600">
                  {job.salary} triệu đồng
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-600">
                <HiOutlineCalendar size={14} />
              </span>
              <span>
                Hạn nộp hồ sơ:{" "}
                <span className="font-medium">{formatDate(job.deadline)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-600">
                <HiOutlineLocationMarker size={14} />
              </span>
              <span>
                Khu vực tuyển:{" "}
                <span className="font-medium">{company?.city || "N/A"}</span>
              </span>
            </div>
          </div>
          {isFirstApplicantOpportunity && !hasApplied && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-3 py-1.5 rounded-md mb-4">
              <span className="flex items-center justify-center w-5 h-5 bg-orange-100 rounded-full">
                <FaBullseye size={10} className="text-orange-600" />
              </span>
              <span className="font-medium">Cơ hội đầu tiên!</span>
              <span className="text-gray-600">
                Hãy là người đầu tiên nộp hồ sơ!
              </span>
            </div>
          )}
          <div className="h-4 mb-2">
            {error && <p className="text-xs text-red-600">{error}</p>}
            {success && <p className="text-xs text-green-600">{success}</p>}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={hasApplied ? handleCancelApply : handleApply}
                disabled={isProcessing}
                className={`flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-md transition-colors w-full md:w-auto text-white
    ${
      hasApplied
        ? "bg-red-600 hover:bg-red-700"
        : "bg-indigo-700 hover:bg-indigo-800"
    }
    ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
  `}
              >
                {isProcessing ? (
                  <span className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4"></span>
                ) : hasApplied ? (
                  <FaTimesCircle />
                ) : (
                  <FaPaperPlane />
                )}
                <span>
                  {isProcessing
                    ? hasApplied
                      ? "Đang hủy..."
                      : "Đang nộp..."
                    : hasApplied
                    ? "Hủy nộp hồ sơ"
                    : "Nộp hồ sơ"}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 w-full md:w-auto justify-end pt-2 md:pt-0">
              <IoCalendarOutline className="text-gray-400" />
              <span>Ngày cập nhật:</span>
              <span className="font-medium">
                {formatDate(job.updatedAt, true)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-6 relative after:content-[''] after:w-16 after:h-1 after:bg-blue-500 after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2">
                Thông tin ứng tuyển
              </h2>

              {userData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Tên", value: userData.fullName },
                    { label: "Điện thoại", value: userData.phone },
                    { label: "Email", value: userData.email },
                  ].map((field, index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {field.label}
                      </label>
                      <div className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50">
                        {field.value}
                      </div>
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      CV
                    </label>
                    <div className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50 group">
                      <a
                        href={`http://localhost:8000${userData.cvUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Xem CV (PDF)
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-end gap-4 mt-8 border-t border-gray-100 pt-6">
                <button
                  onClick={handleCancelApplyModal}
                  className="px-6 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmApply}
                  className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Xác nhận ứng tuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobHeaderCard;
