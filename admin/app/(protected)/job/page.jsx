"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import JobTable from "@/components/JobTable";
import CompanyModal from "@/components/CompanyModal";
import EmployerModal from "@/components/EmployerModal";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Paginations";
import Cookies from "js-cookie";

const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEmployerOpen, setIsEmployerOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);

  const fetchJobs = async (page = 1) => {
    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `http://localhost:8000/api/v1/admin/jobs?page=${page}&limit=5&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobPostings || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
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

  const handleDelete = (id) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      const token = Cookies.get("adminToken");

      const res = await fetch(
        `http://localhost:8000/api/v1/admin/jobs/${jobToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("Delete response:", data);

      if (res.ok) {
        fetchJobs(currentPage); // reload lại
        setIsDeleteModalOpen(false);
      } else {
        console.error("Xóa thất bại", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
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
            <p className="text-gray-300">Đang tải dữ liệu...</p>
          ) : (
            <JobTable
              jobPostings={jobs}
              onViewCompany={handleViewCompany}
              onDelete={handleDelete}
              onViewEmployer={handleViewEmployer}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        message="Bạn chắc chắn muốn xóa công việc này?"
      />

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
    </div>
  );
};

export default JobPage;
