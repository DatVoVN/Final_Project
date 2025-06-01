"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DeveloperTable from "@/components/DeveloperTable";
import Cookies from "js-cookie";
import ConfirmModal from "@/components/ConfirmModal";
import CompanyModal from "@/components/CompanyModal";
import Pagination from "@/components/Paginations";
import toast from "react-hot-toast";

const Page = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const fetchDevelopers = async (page = 1) => {
    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `${BASE_URL}/api/v1/admin/employers?page=${page}&limit=5&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setDevelopers(data.employers || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Lỗi khi tải developers:", data.message);
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
      fetchDevelopers(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchDevelopers(currentPage);
  }, [currentPage]);

  const handleViewCompany = (dev) => {
    setSelectedCompany(dev.company);
    setIsCompanyModalOpen(true);
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="text-sm text-white">
          <p>Bạn có chắc chắn muốn xóa developer này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  const token = Cookies.get("adminToken");
                  const res = await fetch(
                    `${BASE_URL}/api/v1/admin/employers/${id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  if (!res.ok) throw new Error("Delete failed");

                  toast.success("✅ Đã xóa developer thành công");
                  setDevelopers((prev) => prev.filter((dev) => dev._id !== id));
                } catch (error) {
                  toast.error("❌ Có lỗi khi xóa developer");
                  console.error("Lỗi khi xóa developer:", error);
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

  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
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
              Danh sách Developer
            </h2>
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
            <DeveloperTable
              developers={developers}
              onViewCompany={handleViewCompany}
              onDelete={handleDelete}
            />
          )}

          {developers.length > 0 && totalPages > 1 && (
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
    </div>
  );
};

export default Page;
