"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
import JobTable from "@/components/JobTable";
import CompanyModal from "@/components/CompanyModal";
import EmployerModal from "@/components/EmployerModal";
const page = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [developerToDelete, setDeveloperToDelete] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEmployerOpen, setIsEmployerOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/developer/jobs");
        const data = await res.json();
        if (res.ok) {
          setJobs(data.data);
        } else {
          console.error("Failed to fetch: ", data.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, []);
  const handleViewCompany = (dev) => {
    setSelectedCompany(dev.company);
    setIsCompanyModalOpen(true);
  };
  const handleViewEmployer = (dev) => {
    setSelectedEmployer(dev.employer);
    setIsEmployerOpen(true);
  };
  const handleDelete = (id) => {
    setDeveloperToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeveloperToDelete(null);
  };
  const closeEmployerModal = () => {
    setIsEmployerOpen(false);
    setSelectedEmployer(null);
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
        <h2 className="text-xl font-bold text-white mb-4">TOÀN BỘ JOB</h2>
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
    </div>
  );
};

export default page;
