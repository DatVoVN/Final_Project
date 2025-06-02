"use client";
import BlogIT from "@/components/Blog/BlogIT";
import ReviewForm from "@/components/Review/ReviewForm";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import BASE_URL from "@/utils/config";
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
      alert("You need to be logged in to follow a company.");
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
    } catch (err) {
      console.error("Error updating follow status:", err);
    }
  };

  const isLoading = loadingDetails || loadingReviews;
  const criticalError = errorDetails;

  if (isLoading) return <div className="text-center p-10">Loading...</div>;
  if (criticalError)
    return <div className="text-center p-10 text-red-500">{criticalError}</div>;
  if (!companyDetails)
    return <div className="text-center p-10">Không tìm thấy công ty.</div>;

  const skills =
    companyDetails?.languages &&
    companyDetails.languages.length > 0 &&
    typeof companyDetails.languages[0] === "string"
      ? companyDetails.languages[0]
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill)
      : [];
  return (
    <div className="h-auto w-full bg-gray-50 pb-10">
      <div className="w-full h-auto md:h-80 grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 shadow-md rounded-xl p-6 gap-6 md:gap-8 mb-5">
        <div className="flex justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
            <div className="flex-shrink-0">
              {companyDetails.avatarUrl && (
                <img
                  src={companyDetails.avatarUrl}
                  alt={`${companyDetails.name || "Company"} logo`}
                  className="w-28 h-28 object-cover rounded-lg shadow-md border border-gray-100 mx-auto sm:mx-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-800 mb-3">
                {companyDetails.name || "Company Name"}
              </div>
              <div className="flex gap-4 justify-center sm:justify-start">
                <button
                  onClick={handleFollow}
                  className={`px-5 py-2 rounded-full shadow-sm text-sm font-medium transition duration-150
      ${
        likedStatus
          ? "bg-red-100 text-red-600 border border-red-300 hover:bg-red-200"
          : "bg-white text-indigo-600 border border-indigo-300 hover:bg-gray-50"
      }`}
                >
                  {likedStatus ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-4 md:mt-0">
          <Link href={`/alljob/${companyDetails._id}`}>
            <div className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md shadow-sm text-sm font-medium transition duration-150 cursor-pointer">
              Số lượng Job hiện có
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
          <div className="space-y-5">
            <div className="bg-white shadow-md rounded-2xl px-4 py-5 sm:px-5 sm:pt-6 sm:pb-8 xl:px-6 xl:pb-8">
              <h2 className="border-b border-dashed pb-4 text-lg sm:text-xl font-semibold text-gray-800">
                Thông tin công ty
              </h2>
              <div className="flex flex-col xl:flex-row xl:pt-4 divide-y xl:divide-y-0 xl:divide-x divide-dotted text-sm sm:text-base">
                <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
                  <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    Loại Công Ty
                  </div>
                  <div className="text-sm sm:text-base">IT Product</div>
                </div>
                <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
                  <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    Địa chỉ công ty
                  </div>
                  <div className="text-right xl:text-left">
                    <div className="pl-2 md:pl-0">
                      <div className="inline-flex flex-wrap text-sm sm:text-base">
                        {companyDetails.city ? "" : ""}
                        {companyDetails.city || ""}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
                  <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    Quy mô công ty
                  </div>
                  <div className="text-sm sm:text-base">
                    {companyDetails.companySize
                      ? `${companyDetails.companySize} nhân viên`
                      : "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col xl:flex-row xl:pt-4 divide-y xl:divide-y-0 xl:divide-x divide-dotted mt-2 xl:mt-0 text-sm sm:text-base">
                <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
                  <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    Email
                  </div>
                  <div className="text-sm sm:text-base">
                    {companyDetails.email || "N/A"}
                  </div>
                </div>
                <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
                  <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    Working days
                  </div>
                  <div className="text-sm sm:text-base">
                    {companyDetails.workingDays?.from &&
                    companyDetails.workingDays?.to
                      ? `${companyDetails.workingDays.from} - ${companyDetails.workingDays.to}`
                      : "N/A"}
                  </div>
                </div>
                <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
                  <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    Chính sách Overtime
                  </div>
                  <div className="text-sm sm:text-base">
                    {companyDetails.overtimePolicy || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {companyDetails.overview && (
              <div className="bg-white shadow-md rounded-2xl px-4 py-5 sm:px-5 sm:pt-6 sm:pb-8 xl:px-6 xl:pb-8">
                <h2 className="border-b border-dashed pb-4 text-lg sm:text-xl font-semibold">
                  Tổng quan về công ty
                </h2>
                <div className="pt-4 break-words prose prose-sm sm:prose max-w-none text-gray-700">
                  {companyDetails.overview
                    .split("\n")
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </div>
            )}

            {(skills.length > 0 || companyDetails.description) && (
              <div className="bg-white shadow-md rounded-2xl px-4 py-5 sm:px-5 sm:pt-6 sm:pb-8 xl:px-6 xl:pb-8">
                <h2 className="border-b border-dashed pb-4 text-lg sm:text-xl font-semibold">
                  Our key skills & Description
                </h2>
                <div className="pt-4 break-words">
                  {skills.length > 0 && (
                    <>
                      <div className="text-base sm:text-lg font-medium">
                        Skills We Use
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-full cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {companyDetails.description && (
                    <div
                      className={`prose prose-sm sm:prose max-w-none text-gray-700 ${
                        skills.length > 0
                          ? "mt-4 border-t border-dashed pt-4"
                          : "pt-4"
                      }`}
                    >
                      <div className="text-base sm:text-lg font-medium mb-2">
                        Mô tả
                      </div>
                      {companyDetails.description
                        .split("\n")
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
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
              <div className="text-center p-10">Loading reviews...</div>
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
