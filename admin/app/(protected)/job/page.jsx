"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import JobTable from "@/components/JobTable";
import CompanyModal from "@/components/CompanyModal";
import EmployerModal from "@/components/EmployerModal";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Paginations";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import JobDetailModal from "@/components/JobDetailModal";
import BASE_URL from "@/utils/config";
const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEmployerOpen, setIsEmployerOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // const BASE_URL =
  //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const fetchJobs = async (page = 1) => {
    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `${BASE_URL}/api/v1/admin/jobs?page=${page}&limit=6&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobPostings || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error("Lỗi khi tải job:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJobs(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const handleViewJob = async (jobId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/developer/jobs/${jobId}`);
      const data = await res.json();

      if (res.ok) {
        setSelectedJob(data.data);
        setIsJobModalOpen(true);
      } else {
        toast.error("Không thể tải thông tin công việc");
      }
    } catch (error) {
      console.error("Lỗi khi xem chi tiết job:", error);
      toast.error("Có lỗi xảy ra khi lấy dữ liệu");
    }
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="text-sm text-white">
          <p>Bạn có chắc chắn muốn xóa công việc này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  const token = Cookies.get("adminToken");
                  const res = await fetch(
                    `${BASE_URL}/api/v1/admin/jobs/${id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const data = await res.json();

                  if (res.ok) {
                    toast.success("Đã xóa công việc thành công");
                    fetchJobs(currentPage);
                  } else {
                    toast.error(
                      `Xóa thất bại: ${data.message || "Không xác định"}`
                    );
                  }
                } catch (error) {
                  toast.error("Có lỗi xảy ra khi xóa");
                  console.error("Lỗi khi xóa:", error);
                } finally {
                  toast.dismiss(t.id);
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-500"
            >
              Xóa
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: "#1e1e1e",
          color: "#fff",
        },
      }
    );
  };

  const handleViewCompany = (job) => {
    setSelectedCompany(job.company);
    setIsCompanyModalOpen(true);
  };

  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
  };

  const handleViewEmployer = (job) => {
    setSelectedEmployer(job.employer);
    setIsEmployerOpen(true);
  };

  const closeEmployerModal = () => {
    setIsEmployerOpen(false);
    setSelectedEmployer(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen p-6">
      <main className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-white">
              Danh sách Công việc
            </h2>
            <div className="flex items-center gap-4 flex-grow max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg px-4 py-2 text-white flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isSearching && (
            <div className="text-gray-400 mb-2 flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang tìm kiếm...
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg
                className="animate-spin h-8 w-8 text-white mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-white text-base font-medium">
                Đang tải dữ liệu...
              </span>
            </div>
          ) : (
            <JobTable
              jobPostings={jobs}
              onViewCompany={handleViewCompany}
              onDelete={handleDelete}
              onViewEmployer={handleViewEmployer}
              onViewJob={handleViewJob}
            />
          )}

          {jobs.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </motion.div>
      </main>
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={closeCompanyModal}
        company={selectedCompany}
      />

      <EmployerModal
        isOpen={isEmployerOpen}
        onClose={closeEmployerModal}
        employer={selectedEmployer}
      />
      <JobDetailModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default JobPage;
