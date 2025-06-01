// components/CompanyInfoBox.jsx
import React, { useState } from "react";
import Link from "next/link";
import { IoLocationSharp } from "react-icons/io5";
import { FaUsers, FaExternalLinkAlt } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const CompanyInfoBox = ({ company }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!company) return null;

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100/80 hover:border-gray-200/90 mt-6 overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {company.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Đang tuyển dụng</span>
            </div>
          </div>
          <Link
            href={`/company/${company._id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors duration-200 font-medium"
          >
            <span>Trang công ty</span>
            <FaExternalLinkAlt className="text-sm -mr-1" />
          </Link>
        </div>

        {/* Company Details */}
        <div className="space-y-4">
          {/* Address */}
          {company.address && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <IoLocationSharp className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Trụ sở chính
                </p>
                <p className="text-gray-800">
                  {company.address}, {company.city}
                </p>
              </div>
            </div>
          )}

          {/* Company Size */}
          {company.companySize && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <FaUsers className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Quy mô</p>
                <p className="text-gray-800">{company.companySize} nhân viên</p>
              </div>
            </div>
          )}
        </div>
        {company.description && (
          <div className="mt-6">
            <div
              className={`text-gray-700 transition-all duration-300 ${
                showFullDescription ? "" : "line-clamp-3"
              }`}
            >
              <p className="leading-relaxed">{company.description}</p>
            </div>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-3 flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showFullDescription ? (
                <>
                  <FiChevronUp className="text-base" />
                  Thu gọn
                </>
              ) : (
                <>
                  <FiChevronDown className="text-base" />
                  Xem thêm
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-pink-200/30 w-full"></div>
    </div>
  );
};

export default CompanyInfoBox;
