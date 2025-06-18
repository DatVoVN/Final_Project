"use client";
import BlogIT from "@/components/Blog/BlogIT";
import ReviewForm from "@/components/Review/ReviewForm";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import BASE_URL from "@/utils/config";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
const CompanyPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [companyDetails, setCompanyDetails] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [likedStatus, setLikedStatus] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState(null);
  const token = Cookies.get("authToken");
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      setLoadingDetails(true);
      setErrorDetails(null);
      try {
        const res = await fetch(`${BASE_URL}/api/v1/developer/companys/${id}`);
        if (!res.ok) throw new Error("Failed to fetch company details");
        const data = await res.json();
        setCompanyDetails(data.data);
      } catch (err) {
        console.error("Error fetching company details:", err);
        setErrorDetails("Failed to load company details.");
      } finally {
        setLoadingDetails(false);
      }
    };

    const fetchReviewData = async () => {
      setLoadingReviews(true);
      setErrorReviews(null);
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/candidates/average-star/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch review data");
        const data = await res.json();
        setReviewData(data.data);
      } catch (err) {
        console.error("Error fetching review data:", err);
        setErrorReviews("Failed to load review data.");
      } finally {
        setLoadingReviews(false);
      }
    };

    const fetchLikedStatus = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/candidates/companies/${id}/liked-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setLikedStatus(data.isLiked);
      } catch (err) {
        console.error("Error fetching liked status:", err);
      }
    };

    if (id) {
      fetchCompanyDetails();
      fetchReviewData();
      fetchLikedStatus();
    } else {
      setLoadingDetails(false);
      setLoadingReviews(false);
      setErrorDetails("Company ID is missing.");
      setErrorReviews("Company ID is missing.");
    }
  }, [id]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleFollow = async () => {
    if (!token) {
      toast.error("Bạn cần đăng nhập");
      return;
    }

    try {
      const url = `${BASE_URL}/api/v1/candidates/favorite-company/${id}`;
      const options = {
        method: likedStatus ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (!likedStatus) {
        options.body = JSON.stringify({});
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Failed to update follow status");

      setLikedStatus((prevStatus) => !prevStatus);

      toast.success(
        likedStatus ? "Đã bỏ theo dõi công ty" : "Đã theo dõi công ty"
      );
    } catch (err) {
      console.error("Error updating follow status:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái theo dõi");
    }
  };

  const isLoading = loadingDetails || loadingReviews;
  const criticalError = errorDetails;

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-[1000px] py-12 text-center">
        <FaSpinner className="animate-spin text-indigo-500 text-5xl mb-6" />
        <p className="text-lg font-medium text-slate-700">Đang tải...</p>
        <p className="text-sm text-slate-500 mt-1">
          Vui lòng đợi trong giây lát.
        </p>
      </div>
    );
  if (criticalError)
    return <div className="text-center p-10 text-red-500">{criticalError}</div>;
  if (!companyDetails)
    return <div className="text-center p-10">Không tìm thấy công ty.</div>;

  const skills = Array.isArray(companyDetails?.languages)
    ? companyDetails.languages
        .flatMap((item) =>
          typeof item === "string"
            ? item.split(",").map((skill) => skill.trim())
            : []
        )
        .filter((skill) => skill)
    : [];

  const avatarUrl = companyDetails.avatarUrl?.startsWith("http")
    ? companyDetails.avatarUrl
    : `/${companyDetails.avatarUrl?.replace(/^\/?/, "")}`;

  return (
    <div className="h-auto w-full bg-gray-50 pb-10">
      <div className="w-full h-auto md:h-80 grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 shadow-md rounded-xl p-6 gap-6 md:gap-8 mb-5">
        <div className="flex justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left p-6 bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-4xl">
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt={`${companyDetails.name || "Company"} logo`}
                className="w-28 h-28 object-cover rounded-xl shadow-inner border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/company.png";
                }}
              />
            </div>

            <div className="flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {companyDetails.name || "Company Name"}
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Công ty uy tín với nhiều cơ hội việc làm hấp dẫn. Hãy theo dõi
                để không bỏ lỡ!
              </p>

              <div className="flex gap-4 justify-center sm:justify-start">
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition duration-200 flex items-center gap-2
            ${
              likedStatus
                ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100"
                : "bg-indigo-50 text-indigo-600 border border-indigo-300 hover:bg-indigo-100"
            }`}
                >
                  {likedStatus ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 12H6"
                        />
                      </svg>
                      <span>Bỏ theo dõi</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m6-6H6"
                        />
                      </svg>
                      <span>Theo dõi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-4 md:mt-0">
          <Link href={`/alljob/${companyDetails._id}`}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full shadow-md text-sm font-semibold transition duration-200 transform hover:scale-105 cursor-pointer">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h4l3 10h8l3-10h4M9 10V5a1 1 0 011-1h4a1 1 0 011 1v5"
                />
              </svg>
              <span>Xem các công việc đang tuyển</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl mb-5 sticky top-0 justify-center items-center z-10 p-4 sm:p-6 md:p-10">
        <ul className="flex justify-center gap-6 sm:gap-8 px-3 sm:px-5 ">
          <li className="list-none">
            <button
              onClick={() => handleTabClick("overview")}
              className={`font-medium pb-2 text-sm sm:text-base transition-colors hover:text-blue-600 ${
                activeTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Tổng quan
            </button>
          </li>
          <li className="list-none relative">
            <button
              onClick={() => handleTabClick("reviews")}
              className={`font-medium pb-2 text-sm sm:text-base transition-colors hover:text-blue-600 ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Đánh giá
              {!loadingReviews && reviewData?.reviews?.length > 0 && (
                <div className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-[0.5]">
                  {reviewData.reviews.length}
                </div>
              )}
              {errorReviews && (
                <div
                  className="absolute -top-2 -right-4 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-[0.5]"
                  title={errorReviews}
                >
                  !
                </div>
              )}
            </button>
          </li>
        </ul>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Thông tin công ty
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Loại hình công ty
                    </div>
                    <div className="text-gray-800 font-medium">
                      {companyDetails.companyType || "IT Product"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Địa chỉ công ty
                    </div>
                    <div className="text-gray-800 font-medium">
                      {companyDetails.address || "Chưa cập nhật"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Quy mô công ty
                    </div>
                    <div className="text-gray-800 font-medium">
                      {companyDetails.companySize
                        ? `${companyDetails.companySize} nhân viên`
                        : "Chưa cập nhật"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Email liên hệ
                    </div>
                    <div className="text-gray-800 font-medium">
                      {companyDetails.email || "Chưa cập nhật"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Ngày làm việc
                    </div>
                    <div className="text-gray-800 font-medium">
                      {companyDetails.workingDays?.from &&
                      companyDetails.workingDays?.to
                        ? `${companyDetails.workingDays.from} - ${companyDetails.workingDays.to}`
                        : "Thứ 2 - Thứ 6"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm font-medium mb-1">
                      Chính sách tăng ca
                    </div>
                    <div className="text-gray-800 font-medium">
                      {companyDetails.overtimePolicy || "Theo luật lao động"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {companyDetails.overview && (
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Tổng quan về công ty
                  </h2>
                </div>
                <div className="p-6 prose prose-blue max-w-none">
                  {companyDetails.overview
                    .split("\n")
                    .map((paragraph, index) => (
                      <p key={index} className="text-gray-700 mb-3">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>
            )}
            {(skills.length > 0 || companyDetails.description) && (
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Kỹ năng chính & Mô tả công ty
                  </h2>
                </div>
                <div className="p-6">
                  {skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Công nghệ & Kỹ năng sử dụng
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {companyDetails.description && (
                    <div
                      className={
                        skills.length > 0 ? "border-t border-gray-200 pt-6" : ""
                      }
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Mô tả chi tiết
                      </h3>
                      <div className="prose prose-blue max-w-none">
                        {companyDetails.description
                          .split("\n")
                          .map((paragraph, index) => (
                            <p key={index} className="text-gray-700 mb-3">
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {errorReviews && (
              <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
                {errorReviews}
              </div>
            )}
            {!errorReviews && !loadingReviews && reviewData && (
              <>
                <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
                  <h2 className="text-xl font-semibold mb-2">Overall Rating</h2>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-500 text-2xl font-bold">
                      {reviewData.avgRating}★
                    </div>
                    <span className="text-gray-600 text-sm">
                      ({reviewData.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Đánh giá của nhân viên
                  </h3>
                  {reviewData.reviews && reviewData.reviews.length > 0 ? (
                    reviewData.reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mb-4"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">
                            {review.candidate?.fullName || "Anonymous"}
                          </span>
                          <span className="text-yellow-500 font-semibold">
                            {review.rating} ★
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">
                      Hiện không có đánh giá nào cả.
                    </p>
                  )}
                </div>

                <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
                  <div className="text-2xl font-semibold mb-4">
                    Cảm nghĩ của bạn về công ty{" "}
                    {companyDetails.name || "this company"}
                  </div>
                  <ReviewForm companyId={id} />
                </div>
              </>
            )}
            {!errorReviews && loadingReviews && (
              <div className="flex flex-col justify-center items-center min-h-[1000px] py-12 text-center">
                <FaSpinner className="animate-spin text-indigo-500 text-5xl mb-6" />
                <p className="text-lg font-medium text-slate-700">
                  Đang tải nhận xét...
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Vui lòng đợi trong giây lát.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <BlogIT />
      </div>
    </div>
  );
};

export default CompanyPage;
