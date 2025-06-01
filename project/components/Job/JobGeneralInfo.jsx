// components/JobGeneralInfo.jsx
import React from "react";
import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineHashtag,
} from "react-icons/hi";

const JobGeneralInfo = ({ job }) => {
  if (!job) return null;

  return (
    <>
      <h2 className="text-xl font-semibold mb-5">Thông tin chung</h2>
      <div className="bg-indigo-50 px-4 pt-5 pb-1 mb-6 rounded-lg border border-indigo-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 pb-2">
          <div className="flex items-center">
            <i className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <HiOutlineCalendar />
            </i>
            <div className="ml-3">
              <p className="text-gray-600 text-xs">Ngày đăng</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDate(job.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <i className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <HiOutlineIdentification />
            </i>
            <div className="ml-3">
              <p className="text-gray-600 text-xs">Cấp bậc</p>
              <p className="text-sm font-medium text-gray-800">
                {job.experienceLevel || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <i className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <HiOutlineUserGroup />
            </i>
            <div className="ml-3">
              <p className="text-gray-600 text-xs">Số lượng tuyển</p>
              <p className="text-sm font-medium text-gray-800">
                {job.vacancies || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <i className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <HiOutlineBriefcase />
            </i>
            <div className="ml-3">
              <p className="text-gray-600 text-xs">Hình thức làm việc</p>
              <p className="text-sm font-medium text-gray-800">
                {job.jobType || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <i className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <HiOutlineClock />
            </i>
            <div className="ml-3">
              <p className="text-gray-600 text-xs">Kinh nghiệm</p>
              <p className="text-sm font-medium text-gray-800">
                {job.experienceLevel || "Không yêu cầu"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <i className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
              <HiOutlineHashtag />
            </i>
            <div className="ml-3 overflow-hidden">
              <p className="text-gray-600 text-xs">Ngành nghề / Kỹ năng</p>
              <p className="text-sm font-medium text-indigo-600 flex flex-wrap gap-1">
                {job.languages && job.languages.length > 0 ? (
                  job.languages.map((lang, index) => (
                    <span key={index} className="whitespace-nowrap">
                      <Link
                        href={`/jobs/skill/${lang.toLowerCase()}`}
                        className="hover:underline"
                      >
                        {lang}
                      </Link>
                      {index < job.languages.length - 1 && (
                        <span className="mx-1 text-gray-400">/</span>
                      )}
                    </span>
                  ))
                ) : (
                  <span>N/A</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobGeneralInfo;
