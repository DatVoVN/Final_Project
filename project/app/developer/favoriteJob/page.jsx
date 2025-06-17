"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaTrash,
} from "react-icons/fa";
import Link from "next/link";
import Pagination from "@/components/Pagination";

const FavoriteJobPage = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    const fetchFavoriteJobs = async (page = 1) => {
      setLoading(true);
      setError(null);

      const token = Cookies.get("authToken");

      if (!token) {
        setError("Bạn cần đăng nhập để xem công việc yêu thích.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/candidates/interested/favorites?page=${page}&limit=${jobsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Không thể tải công việc yêu thích");

        const data = await res.json();
        const { jobs, totalPages, currentPage } = data;

        if (Array.isArray(jobs)) {
          setFavoriteJobs(jobs);
          setTotalPages(totalPages);
          setCurrentPage(currentPage);
        } else {
          setFavoriteJobs([]);
          setError("Không tìm thấy danh sách công việc yêu thích.");
        }
      } catch (err) {
        console.error("Lỗi khi tải công việc yêu thích:", err);
        setError("Không thể tải danh sách công việc yêu thích.");
        setFavoriteJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteJobs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };
  const handleRemoveFavorite = async (jobId) => {
    const token = Cookies.get("authToken");

    if (!token) {
      toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/candidates/interested/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Xóa công việc yêu thích thất bại");

      setFavoriteJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error("Lỗi khi xóa công việc yêu thích:", err);
      alert("Không thể xóa công việc khỏi danh sách yêu thích.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] p-6">
        <FaSpinner className="animate-spin text-2xl text-indigo-600 mr-2" />
        Đang tải danh sách...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center">
        <FaExclamationTriangle className="mr-2" />
        {error}
      </div>
    );
  }

  if (!Array.isArray(favoriteJobs) || favoriteJobs.length === 0) {
    return (
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
              Bạn chưa lưu công việc yêu thích nào. Hãy khám phá và thêm những
              công việc phù hợp!
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/alljob")}
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
            Khám phá công việc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-10 relative group">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
          Công Việc Yêu Thích
        </h1>
        <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 w-24 mx-auto rounded-full transform group-hover:scale-x-125 transition-transform duration-300" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favoriteJobs.map((job) => (
          <div
            key={job._id}
            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-500 transition-all duration-300 ease-in-out overflow-hidden flex flex-col"
          >
            <div className="p-5 flex-grow">
              <div className="flex items-start gap-4">
                <Link
                  href={`/company/${job.company?._id}`}
                  className="flex-shrink-0 block"
                >
                  <figure className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={
                        job.company?.avatarUrl
                          ? `${job.company.avatarUrl}`
                          : "/company.png"
                      }
                      alt={job.company?.name}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {job.jobType && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                            {job.jobType}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-md">
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>
                      <Link href={`/jobdetail/${job._id}`} className="block">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(job.postedDate).toLocaleDateString("vi-VN")}
                      </span>
                      <button
                        onClick={() => handleRemoveFavorite(job._id)}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/company/${job.company?._id}`}
                    className="block mb-2"
                  >
                    <h4 className="text-sm text-slate-600 font-medium group-hover:text-indigo-500 transition-colors">
                      {job.company?.name}
                    </h4>
                  </Link>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <FaMoneyBillWave className="text-green-600" />
                      <span className="font-medium">
                        {job.salary
                          ? `${job.salary.toLocaleString("vi-VN")} Đồng`
                          : "Thoả thuận"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-indigo-600" />
                      <span>
                        {[job.locationType, job.company?.city]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {job.languages && job.languages.length > 0 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {job.languages.slice(0, 3).map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                  {job.languages.length > 3 && (
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 text-sm rounded-full">
                      +{job.languages.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {favoriteJobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default FavoriteJobPage;
