"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
import CandidateTable from "@/components/CandidateTable";
import Cookies from "js-cookie";
import ConfirmModal from "@/components/ConfirmModal";
import ProfileModal from "@/components/ProfileModal";

const Page = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [candidateToView, setCandidateToView] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = Cookies.get("adminToken");
        const res = await fetch(
          "http://localhost:8000/api/v1/admin/candidates",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setCandidates(data.candidates);
        } else {
          console.error("Failed to fetch:", data.message);
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

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
        ); // Cập nhật lại để xóa ứng viên
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

  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard name="Total Sales" icon={DollarSign} value="$12000" />
          <StatCard name="Total Client" icon={User} value="14000" />
          <StatCard name="Total Product" icon={ShoppingBag} value="674" />
          <StatCard name="Stock" icon={SquareActivity} value="128128" />
        </motion.div>

        <h2 className="text-xl font-bold text-white mb-4">
          Danh sách Ứng viên
        </h2>

        {loading ? (
          <p className="text-gray-300">Đang tải dữ liệu...</p>
        ) : (
          <CandidateTable
            candidates={candidates}
            onViewProfile={handleViewProfile}
            onDelete={handleDelete}
          />
        )}
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
