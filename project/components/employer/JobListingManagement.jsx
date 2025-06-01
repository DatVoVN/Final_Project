"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import JobFilterBar from "../JobListing/JobFilterBar";
import JobEmptyState from "../JobListing/JobEmptyState";
import JobTable from "../JobListing/JobTable";

const getStatus = (isActive, deadline) => {
  const now = new Date();
  const deadlineDate = deadline ? new Date(deadline) : null;

  if (!isActive)
    return { text: "Đã ẩn", color: "text-gray-500", bg: "bg-gray-100" };
  if (deadlineDate && deadlineDate < now)
    return { text: "Hết hạn", color: "text-red-600", bg: "bg-red-100" };
  return { text: "Đang hiển thị", color: "text-green-600", bg: "bg-green-100" };
};

const JobListingManagement = () => {
  const filterOptions = {
    status: ["Tất cả trạng thái", "Đang hiển thị", "Hết hạn", "Đã ẩn"],
  };

  const [selectedStatus, setSelectedStatus] = useState(filterOptions.status[0]);
  const [jobData, setJobData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = Cookies.get("token");

    if (!token) {
      setError("Lỗi xác thực: Không tìm thấy token. Vui lòng đăng nhập lại.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/developer/employer/jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Không thể tải danh sách công việc.");

      setJobData(result.jobPostings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobData = useMemo(() => {
    if (selectedStatus === filterOptions.status[0]) return jobData;
    return jobData.filter(
      (job) =>
        getStatus(job.isActive, job.deadline).text.trim().toLowerCase() ===
        selectedStatus.trim().toLowerCase()
    );
  }, [jobData, selectedStatus]);

  return (
    <>
      <JobFilterBar
        selectedStatus={selectedStatus}
        setSelectedStatus={(status) => {
          setSelectedStatus(status);
          fetchJobs();
        }}
        filterOptions={filterOptions}
      />

      {isLoading || error || filteredJobData.length === 0 ? (
        <JobEmptyState isLoading={isLoading} error={error} />
      ) : (
        <JobTable jobData={filteredJobData} getStatus={getStatus} />
      )}
    </>
  );
};

export default JobListingManagement;
