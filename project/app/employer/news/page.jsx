"use client";
import React, { act, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineViewGrid,
  HiOutlineDocumentAdd,
  HiOutlineUsers,
  HiOutlineChatAlt2,
  HiLogout,
  HiOutlineUser,
  HiOutlineChatAlt,
  HiOutlineCube,
  HiOutlineReceiptRefund,
} from "react-icons/hi";
import BASE_URL from "@/utils/config";
import JobListingManagement from "@/components/employer/JobListingManagement";
import PostJobForm from "@/components/employer/PostJobForm";
import ApplicantManagementPage from "@/components/employer/ApplicantManagementPage";
import Logout from "@/components/employer/Logout";
import Me from "@/components/employer/Me";
import FeedE from "@/components/FeedE/FeedE";
import Package from "@/components/Package/Package";
import Receipt from "@/components/employer/Receipt";

const EmployerDashboard = () => {
  const [activeView, setActiveView] = useState("listing");
  const handleShowPostForm = () => setActiveView("posting");
  const handleShowListing = () => setActiveView("listing");
  const handleShowApplicants = () => setActiveView("applicants");
  const handleClosePostForm = () => setActiveView("listing");
  const handleLogout = () => setActiveView("logout");
  const handleMe = () => setActiveView("me");
  const handleFeed = () => setActiveView("feed");
  const handlePackage = () => setActiveView("package");
  const handleReceipt = () => setActiveView("receipt");
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white p-4 flex flex-col border-r border-gray-200 flex-shrink-0">
        <div className="mb-6">
          <button
            onClick={handleShowPostForm}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Đăng tin ngay
          </button>
        </div>
        <nav className="flex-grow space-y-1">
          <button
            onClick={handleShowListing}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "listing"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "listing" ? "page" : undefined}
          >
            <HiOutlineViewGrid className="h-5 w-5" />
            Quản lý tin đăng
          </button>
          <button
            onClick={handleShowPostForm}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "posting"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "posting" ? "page" : undefined}
          >
            <HiOutlineDocumentAdd className="h-5 w-5" />
            Tạo tin tuyển dụng
          </button>
          <button
            onClick={handleShowApplicants}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "applicants"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "applicants" ? "page" : undefined}
          >
            <HiOutlineUsers className="h-5 w-5" />
            Quản lý hồ sơ
          </button>
          <button
            onClick={handleMe}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "me"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "me" ? "page" : undefined}
          >
            <HiOutlineUser className="h-5 w-5" />
            Hồ sơ của tôi
          </button>
          <button
            onClick={handleFeed}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "feed"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "feed" ? "page" : undefined}
          >
            <HiOutlineChatAlt className="h-5 w-5" />
            Bảng Feed
          </button>
          <button
            onClick={handlePackage}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "package"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "package" ? "page" : undefined}
          >
            <HiOutlineCube className="h-5 w-5" />
            Gói đăng kí
          </button>
          <button
            onClick={handleReceipt}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "receipt"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "receipt" ? "page" : undefined}
          >
            <HiOutlineReceiptRefund className="h-5 w-5" />
            Hóa đơn thanh toán
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeView === "logout"
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={activeView === "logout" ? "page" : undefined}
          >
            <HiLogout className="h-5 w-5" />
            Đăng xuất
          </button>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {activeView === "listing" && <JobListingManagement />}
          {activeView === "posting" && (
            <PostJobForm onCancel={handleClosePostForm} />
          )}
          {activeView === "applicants" && <ApplicantManagementPage />}
          {activeView === "logout" && <Logout />}
          {activeView === "me" && <Me />}
          {activeView === "feed" && <FeedE />}
          {activeView === "package" && <Package />}
          {activeView === "receipt" && <Receipt />}
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
