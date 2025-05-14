"use client";
import React from "react";
import { Eye, EyeClosed, Trash } from "lucide-react";

const JobTable = ({ jobPostings, onViewCompany, onDelete, onViewEmployer }) => {
  if (!jobPostings || jobPostings.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        Không có dữ liệu công việc.
      </p>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-8 border-white border">
      <table className="w-full text-sm text-left text-gray-300 border-white border">
        <thead className="text-xs text-gray-100 uppercase">
          <tr>
            <th className="px-6 py-3">Tiêu đề</th>
            <th className="px-6 py-3">Mô tả</th>
            <th className="px-6 py-3">Công ty</th>
            <th className="px-6 py-3">Email Nhà tuyển dụng</th>
            <th className="px-6 py-3">Ngày đăng</th>
            <th className="px-6 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobPostings.map((job) => (
            <tr
              key={job._id}
              className="border-b border-white hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td className="px-6 py-4 font-medium text-gray-50 whitespace-nowrap">
                {job.title}
              </td>
              <td className="px-6 py-4">{job.description}</td>
              <td className="px-6 py-4">{job.company.name}</td>
              <td className="px-6 py-4">{job.employer.email}</td>
              <td className="px-6 py-4">{formatDate(job.postedDate)}</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button
                  onClick={() => onViewCompany && onViewCompany(job)}
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Xem công ty"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onViewEmployer && onViewEmployer(job)}
                  className="p-1.5 rounded-full text-blue-400 hover:bg-blue-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Xem thông tin nhà tuyển dụng"
                >
                  <EyeClosed size={18} />
                </button>
                <button
                  onClick={() => onDelete && onDelete(job._id)}
                  className="p-1.5 rounded-full text-red-400 hover:bg-red-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Xóa công việc"
                >
                  <Trash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;
