"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import Pagination from "@/components/Paginations";
import PackageTable from "@/components/PackageTable";
import ConfirmModal from "@/components/ConfirmModal";
import PackageModalAdd from "@/components/PackageModalAdd";
import PackageModalEdit from "@/components/PackageModalEdit";
import PackageModalView from "@/components/PackageModalView";
const PackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const fetchPackages = async (page = 1) => {
    try {
      setLoading(true);
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `http://localhost:8000/api/v1/admin/package?page=${page}&limit=5&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setPackages(data.data || []);
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
      fetchPackages(1);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);
  useEffect(() => {
    fetchPackages(currentPage);
  }, [currentPage]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleDelete = (id) => {
    setPackageToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!packageToDelete) return;

    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `http://localhost:8000/api/v1/admin/package/${packageToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setPackages((prev) =>
          prev.filter((packages) => packages._id !== packageToDelete)
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
    setPackageToDelete(null);
  };
  const handleEdit = (packages) => {
    setSelectedPackage(packages);
    setEditModalOpen(true);
  };
  const handleView = (packages) => {
    setSelectedPackage(packages);
    setViewModalOpen(true);
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
            <h2 className="text-xl font-bold text-white">Danh sách Gói</h2>
            <div className="flex items-center gap-4 flex-grow max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên gói..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg px-4 py-2 text-white flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 whitespace-nowrap"
              >
                + Thêm Gói
              </button>
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
            <PackageTable
              packages={packages}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}

          {packages.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </motion.div>
      </main>
      <PackageModalView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        packages={selectedPackage}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        message="Bạn chắc chắn muốn xóa ứng viên này?"
      />
      <PackageModalAdd
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => fetchPackages(currentPage)}
      />
      <PackageModalEdit
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        packages={selectedPackage}
        packageId={selectedPackage?._id}
        onUpdate={() => fetchPackages(currentPage)}
      />
    </div>
  );
};

export default PackagePage;
