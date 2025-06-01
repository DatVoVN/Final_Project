// components/JobLocation.jsx
import React from "react";
import { IoLocationSharp } from "react-icons/io5";

const JobLocation = ({ company }) => {
  if (!company?.city && !company?.address) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold pt-4 pb-2">Địa điểm làm việc</h2>
      <div className="flex items-center text-sm text-gray-700">
        <IoLocationSharp className="text-indigo-600 mr-2 text-lg shrink-0" />
        <span>
          <span className="font-medium">{company?.city || "N/A"}</span>
          {company?.address && `, ${company.address}`}
        </span>
      </div>
    </div>
  );
};

export default JobLocation;
