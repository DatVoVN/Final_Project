"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import BASE_URL from "@/utils/config";
import {
  FaArrowRight,
  FaBuilding,
  FaExclamationTriangle,
  FaRegSmile,
  FaSpinner,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import Image from "next/image";
import Pagination from "@/components/Pagination";
const FavoriteCompaniesPage = () => {
  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const companiesPerPage = 3;

  useEffect(() => {
    const fetchFavoriteCompanies = async (page = 1) => {
      setLoading(true);
      setError(null);
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must be logged in to view favorite companies.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/candidates/favorite-company/favorites?page=${page}&limit=${companiesPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch favorite companies.");

        const data = await res.json();
        const { companies, totalPages, currentPage } = data;

        setFavoriteCompanies(companies);
        setTotalPages(totalPages);
        setCurrentPage(currentPage);
      } catch (err) {
        console.error("Error fetching favorite companies:", err);
        setError("Failed to fetch favorite companies.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavoriteCompanies(currentPage);
  }, [currentPage]);
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRemoveFavorite = async (companyId) => {
    const token = Cookies.get("authToken");

    if (!token) {
      alert("You need to be logged in to remove a company from favorites.");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/candidates/favorite-company/${companyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to remove favorite company.");

      setFavoriteCompanies((prev) =>
        prev.filter((company) => company._id !== companyId)
      );
    } catch (err) {
      console.error("Error removing favorite company:", err);
      alert("Failed to remove the company from favorites.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[300px] p-6">
        <FaSpinner className="animate-spin text-2xl text-indigo-600 mr-2" />
        Đang tải danh sách...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-red-500 flex items-center">
        <FaExclamationTriangle className="mr-2" />
        {error}
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      {favoriteCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[800px] p-6 bg-gray-50 rounded-xl shadow-sm">
          <div className="max-w-md text-center space-y-6">
            <div className="animate-bounce">
              <svg
                className="w-24 h-24 mx-auto text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.307L4.2 15.3m15.6 0l2.85 2.284a.75.75 0 01-.954 1.166L19.8 15.3"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-gray-800">
                Danh sách trống
              </h3>
              <p className="text-gray-500">
                Bạn chưa lưu công ty yêu thích nào. Hãy khám phá và thêm những
                công việc phù hợp!
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/company")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Khám phá công ty
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="mb-10 relative group">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
              Công Ty Yêu Thích
            </h1>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 w-24 mx-auto rounded-full transform group-hover:scale-x-125 transition-transform duration-300" />
          </div>
          {favoriteCompanies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out
                       overflow-hidden group border border-transparent hover:border-indigo-300"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 bg-slate-50 group-hover:bg-slate-100 transition-colors duration-300 p-6 flex items-center justify-center">
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:border-indigo-200 transition-all duration-300">
                    <Image
                      src={
                        company.avatarUrl
                          ? `${company.avatarUrl}`
                          : "/company.png"
                      }
                      alt={`${company.name || "Company"} logo`}
                      fill
                      style={{ objectFit: "contain" }}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="flex-grow p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <Link href={`/company/${company._id}`} legacyBehavior>
                      <a className="text-2xl sm:text-3xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors duration-200 mb-2 inline-block leading-tight">
                        {company.name || "Tên Công Ty"}
                      </a>
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <FaRegSmile className="w-4 h-4 mr-1.5 text-yellow-500" />
                      <span className="font-medium">
                        Đánh giá nổi bật từ nhân viên
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 italic leading-relaxed line-clamp-3 bg-gray-50 p-3 rounded-md border-l-4 border-indigo-200 group-hover:border-indigo-400 transition-colors duration-300">
                      {company.reviews && company.reviews.length > 0
                        ? `“${company.reviews[0].comment}”`
                        : "Chưa có đánh giá nào được chia sẻ."}
                    </p>
                  </div>
                  <div className="mt-6 text-right">
                    <Link href={`/company/${company._id}`} legacyBehavior>
                      <a className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-semibold group-hover:underline transition-all duration-200">
                        Xem Chi Tiết Công Ty
                        <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                      </a>
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-300 text-white p-6 md:p-8 flex flex-col justify-center items-center space-y-5 md:space-y-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                      <FaStar className="w-6 h-6 text-yellow-300 mb-1" />
                      <span className="text-3xl font-bold">
                        {company.averageStar?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium opacity-80">
                      Điểm Đánh Giá
                    </span>
                  </div>
                  <div className="w-2/3 border-t border-white/30"></div>
                  <div className="flex flex-col items-center">
                    <FaBuilding className="w-6 h-6 text-green-300 mb-1.5" />
                    <span className="text-lg font-semibold">
                      {company.reviews?.length > 0 ? "Tích Cực" : "Chưa Rõ"}
                    </span>
                    <span className="text-xs sm:text-sm font-medium opacity-80">
                      Môi Trường Làm Việc
                    </span>
                  </div>
                  <div className="w-full pt-4 mt-auto">
                    <Link href={`/alljob/${company._id}`} legacyBehavior>
                      <div className="block w-full text-center bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                        Xem Việc Làm
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(company._id)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default FavoriteCompaniesPage;
