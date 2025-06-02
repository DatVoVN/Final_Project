"use client";

import React from "react";
import { HiOutlineShare, HiOutlineFlag } from "react-icons/hi";
import { BiLink } from "react-icons/bi";
import BASE_URL from "@/utils/config";
const JobActions = ({ jobId }) => {
  const handleShare = () => console.log("Share job:", jobId);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép liên kết!");
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Chia sẻ</span>
        <button
          onClick={handleShare}
          className="text-gray-500 hover:text-indigo-600"
          title="Share on Social Media"
        >
          <HiOutlineShare size={20} />
        </button>
        <button
          onClick={handleCopyLink}
          className="text-gray-500 hover:text-indigo-600"
          title="Copy Link"
        >
          <BiLink size={20} />
        </button>
      </div>
    </div>
  );
};

export default JobActions;
