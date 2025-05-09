// app/protected/logout/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // Sử dụng next/navigation để chuyển trang
import LogoutModal from "@/components/LogoutModal";

const LogoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái của modal
  const [isClient, setIsClient] = useState(false); // Đảm bảo code chỉ chạy trên client
  const router = useRouter();

  useEffect(() => {
    // Mở modal ngay lập tức khi vào trang /logout
    setIsModalOpen(true);
    setIsClient(true); // Đảm bảo code chạy trên client
  }, []);

  const handleLogoutConfirm = () => {
    Cookies.remove("adminToken"); // Xóa token đăng nhập
    router.push("/login"); // Chuyển hướng về trang login
  };

  const handleCloseModal = () => {
    router.push("/"); // Quay về trang chủ (hoặc trang mong muốn)
  };

  if (!isClient) {
    return null; // Tránh render trên server
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <LogoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default LogoutPage;
