"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaHeart, FaMoneyBillWave, FaMapMarkerAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
const JobDes = ({ jobs }) => {
  const [likedJobs, setLikedJobs] = useState({});
  const token = Cookies.get("authToken");

  const activeJobs = jobs.filter((job) => job.isActive);

  useEffect(() => {
    const fetchInterestedStatuses = async () => {
      if (!token) return;

      const statuses = {};

      await Promise.all(
        activeJobs.map(async (job) => {
          try {
            const res = await fetch(
              `${BASE_URL}/api/v1/candidates/jobs/${job._id}/interested-status`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            statuses[job._id] = data?.isInterested || false;
          } catch (error) {
            statuses[job._id] = false;
          }
        })
      );

      setLikedJobs(statuses);
    };

    fetchInterestedStatuses();
  }, [activeJobs, token]);

  const handleToggleLike = async (jobId) => {
    if (!token) {
      toast.error("Bạn cần phải đăng nhập");
      return;
    }

    try {
      const url = `${BASE_URL}/api/v1/candidates/interested/${jobId}`;
      const options = {
        method: likedJobs[jobId] ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (!likedJobs[jobId]) {
        options.body = JSON.stringify({});
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error();

      toast.success(
        likedJobs[jobId]
          ? "Đã bỏ yêu thích công việc"
          : "Đã thêm vào danh sách yêu thích"
      );

      setLikedJobs((prev) => ({
        ...prev,
        [jobId]: !prev[jobId],
      }));
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  if (!jobs || jobs.length === 0 || activeJobs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">
          Không có tin tuyển dụng nào đang hoạt động.
        </p>
      </div>
    );
  }

  return (
    <>
      {activeJobs.map((job) => (
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
                        ? `http://localhost:8000/${job.company.avatarUrl}`
                        : "https://via.placeholder.com/150"
                    }
                    alt={job.company?.name}
                    className="w-full h-full object-cover"
                  />
                </figure>
              </Link>

              <div className="flex-1 min-w-0">
                {/* Header Section */}
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
                      Ngày đăng{" "}
                      {new Date(job.postedDate).toLocaleDateString("vi-VN")}
                    </span>
                    <button
                      onClick={() => handleToggleLike(job._id)}
                      className={`text-xl ${
                        likedJobs[job._id]
                          ? "text-pink-500"
                          : "text-slate-400 hover:text-pink-500"
                      }`}
                    >
                      <FaHeart />
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
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <FaMoneyBillWave className="text-green-600" />
                    <span className="font-medium">
                      {job.salary
                        ? `${job.salary.toLocaleString("vi-VN")} Triệu Đồng`
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
    </>
  );
};

export default JobDes;
