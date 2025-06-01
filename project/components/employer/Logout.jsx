"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Logout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/employer");
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Bạn có chắc muốn đăng xuất?
        </h2>
        <div className="flex justify-center gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
