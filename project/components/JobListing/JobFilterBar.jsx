import React from "react";
import { HiOutlineChevronDown, HiOutlineDownload } from "react-icons/hi";

const JobFilterBar = ({ selectedStatus, setSelectedStatus, filterOptions }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
    <div className="flex flex-wrap items-center gap-4">
      <span className="text-sm font-medium text-gray-500 mr-2 flex-shrink-0">
        Lọc theo:
      </span>
      <div className="relative">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="appearance-none w-full sm:w-auto bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md text-sm"
        >
          {filterOptions.status.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <HiOutlineChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  </div>
);

export default JobFilterBar;
