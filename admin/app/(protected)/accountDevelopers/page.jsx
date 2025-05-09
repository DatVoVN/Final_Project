"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
import DeveloperTable from "@/components/DeveloperTable";
import Cookies from "js-cookie";
import ConfirmModal from "@/components/ConfirmModal";
import CompanyModal from "@/components/CompanyModal";

const Page = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [developerToDelete, setDeveloperToDelete] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const token = Cookies.get("adminToken");
        const res = await fetch(
          "http://localhost:8000/api/v1/admin/employers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setDevelopers(data.employers);
        } else {
          console.error("Failed to fetch:", data.message);
        }
      } catch (error) {
        console.error("Error fetching developers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  const handleViewCompany = (dev) => {
    setSelectedCompany(dev.company);
    setIsCompanyModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeveloperToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!developerToDelete) return;

    try {
      const token = Cookies.get("adminToken");
      const res = await fetch(
        `http://localhost:8000/api/v1/admin/employers/${developerToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setDevelopers((prev) =>
          prev.filter((dev) => dev._id !== developerToDelete)
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
    setDeveloperToDelete(null);
  };

  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
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
          Danh sách Developer
        </h2>

        {loading ? (
          <p className="text-gray-300">Đang tải dữ liệu...</p>
        ) : (
          <DeveloperTable
            developers={developers}
            onViewCompany={handleViewCompany}
            onDelete={handleDelete}
          />
        )}
      </main>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        message="Bạn chắc chắn muốn xóa developer này?"
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={closeCompanyModal}
        company={selectedCompany}
      />
    </div>
  );
};

export default Page;
