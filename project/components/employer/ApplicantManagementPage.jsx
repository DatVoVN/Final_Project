"use client";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { VscVmRunning } from "react-icons/vsc";
import Pagination from "../Pagination";
import BASE_URL from "@/utils/config";
const ApplicantManagementPage = () => {
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const token = Cookies.get("token");

  const applicationStatuses = [
    {
      key: "all",
      label: "Tất cả",
      icon: <HiOutlineViewGrid className="h-4 w-4 mr-1.5" />,
    },
    {
      key: "pending",
      label: "Chờ đánh giá",
      icon: <HiOutlineClock className="h-4 w-4 mr-1.5" />,
    },
    {
      key: "approved",
      label: "Phù hợp",
      icon: <HiOutlineCheckCircle className="h-4 w-4 mr-1.5" />,
    },
    {
      key: "rejected",
      label: "Không phù hợp",
      icon: <HiOutlineXCircle className="h-4 w-4 mr-1.5" />,
    },
  ];

  useEffect(() => {
    const fetchApplicantsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/developer/applicants-with-jobs?page=${currentPage}&limit=${itemsPerPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (Array.isArray(data.applicants)) {
          const flattenedApplicants = data.applicants.flatMap((entry) =>
            entry.applicants.map((applicant) => ({
              ...applicant,
              job: entry.job,
            }))
          );

          setApplicants(flattenedApplicants);

          const uniqueJobs = Array.from(
            new Map(
              flattenedApplicants
                .filter((a) => a.job?._id)
                .map((a) => [a.job._id, { id: a.job._id, title: a.job.title }])
            ).values()
          );

          setJobs([{ id: "all", title: "Tất cả tin đăng" }, ...uniqueJobs]);
          setTotalPages(data.totalPages || 1);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching applicants data:", error);
        setLoading(false);
      }
    };

    fetchApplicantsData();
  }, [currentPage]);

  const handleStatusClick = (statusKey) => {
    setSelectedStatus(statusKey);
    setCurrentPage(1);
  };

  const handleJobChange = (event) => {
    setSelectedJob(event.target.value);
    setCurrentPage(1);
  };

  const filteredApplicants = applicants.filter(
    (applicant) =>
      (selectedStatus === "all" || applicant.status === selectedStatus) &&
      (selectedJob === "all" || applicant.job?._id === selectedJob)
  );

  const ApplicantRow = ({ applicant }) => (
    <tr className="bg-white hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {applicant.candidate?.fullName}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {applicant.job?.title || "Không có tên công việc"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {new Date(applicant.appliedAt).toLocaleDateString("vi-VN")}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            applicant.status === "approved"
              ? "bg-green-100 text-green-800"
              : applicant.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : applicant.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {applicationStatuses.find((s) => s.key === applicant.status)?.label ||
            "Không xác định"}
        </span>
      </td>
      <td className="px-4 py-3 flex">
        <a
          href={`http://localhost:8000${applicant.candidate?.cvUrl}` || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          title="Xem hồ sơ"
        >
          <span className="sr-only justify-center">Xem hồ sơ</span>📄
        </a>
      </td>
    </tr>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <label
            htmlFor="jobFilter"
            className="text-sm font-medium text-gray-500 flex-shrink-0"
          >
            Lọc tin đăng:
          </label>
          <div className="relative flex-1 min-w-[250px]">
            <select
              id="jobFilter"
              value={selectedJob}
              onChange={handleJobChange}
              className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-10 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <HiOutlineChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="mb-4 border-b border-gray-200">
          <nav
            className="-mb-px flex space-x-6 overflow-x-auto"
            aria-label="Tabs"
          >
            {applicationStatuses.map((status) => (
              <button
                key={status.key}
                onClick={() => handleStatusClick(status.key)}
                className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium focus:outline-none ${
                  selectedStatus === status.key
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {status.icon}
                {status.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="overflow-x-auto shadow border-b border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên ứng viên ứng tuyển
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tin đăng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian nộp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Chưa có ứng viên ứng tuyển
                </td>
              </tr>
            ) : (
              filteredApplicants.map((applicant) => (
                <ApplicantRow
                  key={`${applicant.candidate?._id}-${applicant.job?._id}-${applicant.appliedAt}`}
                  applicant={applicant}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default ApplicantManagementPage;
