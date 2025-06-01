import React from "react";
import { HiOutlineDocumentSearch } from "react-icons/hi";

const JobEmptyState = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="text-center py-20 text-sm text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-sm text-red-600 bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <HiOutlineDocumentSearch className="h-16 w-16 text-gray-300 mb-3 mx-auto" />
      <p className="text-sm text-gray-500">Không có tin tuyển dụng nào.</p>
    </div>
  );
};

export default JobEmptyState;
