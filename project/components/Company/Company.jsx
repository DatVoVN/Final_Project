"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiArrowRight,
  HiLocationMarker,
  HiBriefcase,
  HiStar,
} from "react-icons/hi";
import BASE_URL from "@/utils/config";
const CompanyCard = ({
  logoUrl = "",
  companyName = "fORNATY",
  skills = ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  location = "Địa Điểm Mặc Định",
  jobCount,
  rating,
  companyLink = "/company/default-company-id",
}) => {
  const [imgSrc, setImgSrc] = useState(logoUrl);
  let skillsJob = [];

  if (typeof skills === "string") {
    try {
      skillsJob = JSON.parse(skills);
      if (!Array.isArray(skillsJob)) {
        skillsJob = [skills];
      }
    } catch (e) {
      skillsJob = skills.split(",").map((s) => s.trim());
    }
  } else if (Array.isArray(skills)) {
    skillsJob = skills;
  }
  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-xl shadow-lg
                 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out
                 p-6 flex flex-col group cursor-pointer"
    >
      <div className="relative flex justify-center mb-5 h-28 group">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
          <Image
            src={imgSrc || "/fallback.jpg"}
            alt={`${companyName} logo`}
            fill
            className="object-contain rounded-full border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgSrc("/fallback.jpg")}
          />
        </div>
        <Link href={companyLink}></Link>
      </div>
      <Link href={companyLink}>
        <div className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 text-center hover:text-indigo-700 transition-colors duration-200 leading-tight line-clamp-2">
          {companyName}
        </div>
      </Link>
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
        {jobCount !== undefined && (
          <span className="flex items-center">
            <HiBriefcase className="w-3.5 h-3.5 mr-1 text-indigo-500" />
            {jobCount} việc làm
          </span>
        )}
        {jobCount !== undefined && rating !== undefined && (
          <span className="opacity-50">|</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-6 min-h-[3.75rem] items-start">
        {skillsJob.slice(0, 5).map((skill, index) => (
          <span
            key={skill + index}
            className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap"
          >
            {skill}
          </span>
        ))}
        {skillsJob.length > 5 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            +{skills.length - 5}
          </span>
        )}
      </div>

      <div className="border-t border-gray-200 w-full my-auto"></div>

      <div className="mt-5 flex flex-col sm:flex-row justify-between items-center text-sm gap-3">
        <span className="flex items-center font-medium text-gray-600 text-center sm:text-left">
          <HiLocationMarker className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </span>

        <Link href={companyLink}>
          <div
            className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                       font-semibold px-5 py-2.5 rounded-lg shadow-md
                       hover:from-indigo-700 hover:to-purple-700
                       transition-all duration-300 ease-in-out transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-xs sm:text-sm whitespace-nowrap"
          >
            Xem Chi Tiết
            <HiArrowRight className="ml-1.5 h-4 w-4 transform transition-transform duration-150 ease-in-out group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
