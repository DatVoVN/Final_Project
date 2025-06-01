// components/Pagination.jsx
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  let visiblePages = pageNumbers;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      visiblePages = [...pageNumbers.slice(0, 5), "...", totalPages];
    } else if (currentPage > totalPages - 4) {
      visiblePages = [
        1,
        "...",
        ...pageNumbers.slice(totalPages - 5, totalPages),
      ];
    } else {
      visiblePages = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center space-x-2 mt-12 mb-8"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-lg hover:bg-indigo-100 text-indigo-600 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
        aria-label="Trang trước"
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>

      {visiblePages.map((number, index) =>
        typeof number === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(number)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                currentPage === number
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
              }`}
            aria-current={currentPage === number ? "page" : undefined}
          >
            {number}
          </button>
        ) : (
          <span key={index} className="px-4 py-2 text-sm text-gray-500">
            {number}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-lg hover:bg-indigo-100 text-indigo-600 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
        aria-label="Trang sau"
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
