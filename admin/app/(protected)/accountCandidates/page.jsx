"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CandidateTable from "@/components/CandidateTable";
import Cookies from "js-cookie";
import ConfirmModal from "@/components/ConfirmModal";
import ProfileModal from "@/components/ProfileModal";
import Pagination from "@/components/Paginations";

const Page = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [candidateToView, setCandidateToView] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCandidates = async (page = 1) => {
    try {
      setLoading(true);
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `http://localhost:8000/api/v1/admin/candidates?page=${page}&limit=5&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCandidates(data.candidates || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Lỗi khi fetch:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCandidates(1);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [currentPage]);

  const handleDelete = (id) => {
    setCandidateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleViewProfile = (candidate) => {
    setCandidateToView(candidate);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setCandidateToView(null);
  };

  const confirmDelete = async () => {
    if (!candidateToDelete) return;

    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `http://localhost:8000/api/v1/admin/candidates/${candidateToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setCandidates((prev) =>
          prev.filter((candidate) => candidate._id !== candidateToDelete)
        );
        setIsDeleteModalOpen(false);
      } else {
        console.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCandidateToDelete(null);
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
            <h2 className="text-xl font-bold text-white">Danh sách Ứng viên</h2>
            <div className="flex items-center gap-4 flex-grow max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm theo email..."
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
            <CandidateTable
              candidates={candidates}
              onViewProfile={handleViewProfile}
              onDelete={handleDelete}
            />
          )}

          {candidates.length > 0 && totalPages > 1 && (
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
        message="Bạn chắc chắn muốn xóa ứng viên này?"
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        candidate={candidateToView}
      />
    </div>
  );
};

export default Page;
