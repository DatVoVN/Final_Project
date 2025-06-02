"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import UserTable from "@/components/UserTable";
import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
import Cookies from "js-cookie";
import Pagination from "@/components/Paginations";
import ConfirmModal from "@/components/ConfirmModal";
import BASE_URL from "@/utils/config";
const Page = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    action: "",
  });
  // const BASE_URL =
  //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  useEffect(() => {
    const fetchPendingEmployers = async () => {
      try {
        const token = Cookies.get("adminToken");
        if (!token) throw new Error("No admin token found");

        const res = await fetch(
          `${BASE_URL}/api/v1/admin/pending-employers?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch pending employers");

        const data = await res.json();
        setUsers(data.items);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEmployers();
  }, [currentPage, limit]);

  const openConfirmModal = (userId, action) => {
    setConfirmModal({ isOpen: true, userId, action });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, userId: null, action: "" });
  };

  const handleConfirmAction = async () => {
    const { userId, action } = confirmModal;
    try {
      const token = Cookies.get("adminToken");
      if (!token) throw new Error("No token found");

      const url = `${BASE_URL}/api/v1/admin/${action}-employer/${userId}`;
      const method = action === "approve" ? "PATCH" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`${action} failed`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(`Lỗi khi ${confirmModal.action} user:`, err);
    } finally {
      closeConfirmModal();
    }
  };

  const handleApproveUser = (userId) => openConfirmModal(userId, "approve");
  const handleRejectUser = (userId) => openConfirmModal(userId, "reject");

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">
            Danh sách đang chờ duyệt tài khoản
          </h2>
          {loading ? (
            <p className="text-white">Đang tải...</p>
          ) : (
            <>
              <UserTable
                users={users}
                onApprove={handleApproveUser}
                onReject={handleRejectUser}
              />
              {users.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </motion.div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        message={
          confirmModal.action === "approve"
            ? "Bạn có chắc muốn DUYỆT tài khoản này?"
            : "Bạn có chắc muốn TỪ CHỐI và XOÁ tài khoản này?"
        }
      />
    </div>
  );
};

export default Page;
