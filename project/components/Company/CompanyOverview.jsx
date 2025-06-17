"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar,
  FaRegSmile,
  FaBuilding,
  FaArrowRight,
  FaSpinner,
  FaExclamationTriangle,
  FaSearchMinus,
} from "react-icons/fa";
import Pagination from "../Pagination";
import BASE_URL from "@/utils/config";
const CompanyOverview = ({ searchQuery, city }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const fetchCompanies = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const baseURL = `${BASE_URL}/api/v1/developer/companys`;

      const queryParams = new URLSearchParams({
        ...(searchQuery && { name: searchQuery }),
        ...(city && { city: city }),
        page,
        limit: 6,
      }).toString();

      const url =
        searchQuery || city
          ? `${baseURL}/search?${queryParams}`
          : `${baseURL}?page=${page}&limit=6`;

      const response = await axios.get(url);
      setCompanies(response.data.companies || []);
      setPagination({
        currentPage: page,
        totalPages: response.data.pagination?.totalPages || 1,
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCompanies([]);
      } else {
        setError(
          "Rất tiếc, đã xảy ra lỗi khi tải danh sách công ty. Vui lòng thử lại sau."
        );
        setCompanies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, [searchQuery, city]);

  const handlePageChange = (newPage) => {
    if (newPage !== pagination.currentPage) {
      fetchCompanies(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[1000px] py-12 text-center">
        <FaSpinner className="animate-spin text-indigo-600 text-5xl mb-6" />
        <p className="text-lg font-medium text-gray-700">
          Đang tải danh sách công ty...
        </p>
        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[1000px] bg-red-50 p-8 rounded-lg shadow-md text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mb-6" />
        <p className="text-xl font-semibold text-red-700 mb-2">
          Ối, có lỗi xảy ra!
        </p>
        <p className="text-gray-700 text-md">{error}</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[1000px] bg-gray-50 p-8 rounded-lg shadow-md text-center">
        <FaSearchMinus className="text-gray-400 text-5xl mb-6" />
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Không tìm thấy công ty nào
        </p>
        <p className="text-gray-600 text-md">
          {searchQuery
            ? `Không có công ty nào phù hợp với từ khóa "${searchQuery}".`
            : "Hiện chưa có thông tin công ty nào."}
        </p>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Vui lòng thử với từ khóa khác.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {companies.map((company) => (
          <div
            key={company._id}
            className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out
                       overflow-hidden group border border-transparent hover:border-indigo-300"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 bg-slate-50 group-hover:bg-slate-100 transition-colors duration-300 p-6 flex items-center justify-center">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:border-indigo-200 transition-all duration-300">
                  <img
                    src={
                      company.avatarUrl
                        ? `${company.avatarUrl}`
                        : "/company.png"
                    }
                    alt={`${company.name || "Company"} logo`}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/company.png";
                    }}
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default CompanyOverview;
