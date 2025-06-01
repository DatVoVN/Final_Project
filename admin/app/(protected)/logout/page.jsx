"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import LogoutModal from "@/components/LogoutModal";

const LogoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsModalOpen(true);
    setIsClient(true);
  }, []);

  const handleLogoutConfirm = () => {
    Cookies.remove("adminToken");
    router.push("/login");
  };

  const handleCloseModal = () => {
    router.push("/");
  };

  if (!isClient) {
    return null;
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
