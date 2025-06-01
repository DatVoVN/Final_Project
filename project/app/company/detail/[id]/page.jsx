"use client";
import BlogIT from "@/components/Blog/BlogIT";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Company = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/developer/companys/${id}`
        );
        setCompany(res.data.data);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCompany();
    } else {
      setLoading(false);
      setError("Company ID is missing.");
    }
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!company)
    return <div className="text-center p-10">Company not found.</div>;

  const skills =
    company.languages &&
    company.languages.length > 0 &&
    typeof company.languages[0] === "string"
      ? company.languages[0]
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill)
      : [];

  return (
    <div className="h-auto w-full">
      <div className="w-full h-auto md:h-80 grid grid-cols-1 md:grid-cols-2 bg-gray-100 shadow-lg rounded-lg p-6 gap-4 md:gap-0">
        <div className="flex justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center text-center sm:text-left">
            <div>
              <img
                src={company.avatarUrl ? `${company.avatarUrl}` : ""}
                alt={`${company.name || "Company"} logo`}
                className="w-24 h-24 object-cover rounded-full shadow-md mx-auto sm:mx-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
            </div>
            <div>
              <div className="text-xl font-semibold mb-2">
                {company.name || "Company Name"}
              </div>
              <div className="flex gap-4 justify-center sm:justify-start">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded shadow text-sm sm:text-base">
                  WRITE REVIEW
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded shadow text-sm sm:text-base">
                  FOLLOW
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4 md:mt-0">
          <Link href={`/company/review/${company._id}`}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded shadow text-sm sm:text-base">
              Review
            </button>
          </Link>
          <Link href={`/alljob/${company._id}`}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded shadow text-sm sm:text-base">
              Job Number
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl mb-5 sticky top-0 justify-center items-center z-10 p-4 sm:p-6 md:p-10 mt-2">
        <ul className="flex justify-center gap-6 sm:gap-8 px-3 sm:px-5 ">
          <li className="list-none">
            <a
              className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2 text-sm sm:text-base"
              href={`/company/${id}`}
            >
              Overview
            </a>
          </li>
          <li className="list-none relative">
            <a
              className="text-gray-600 hover:text-blue-600 transition-colors pb-2 text-sm sm:text-base"
              href={`/company/review/${id}`}
            >
              Reviews
              <div className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-[0.5]">
                {company.reviews?.length}
              </div>
            </a>
          </li>
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-2xl px-4 py-5 sm:px-5 sm:pt-6 sm:pb-8 mb-5 xl:px-6 xl:pb-8">
        <h2 className="border-b border-dashed pb-4 text-lg sm:text-xl font-semibold text-gray-800">
          General information
        </h2>
        <div className="flex flex-col xl:flex-row xl:pt-4 divide-y xl:divide-y-0 xl:divide-x divide-dotted text-sm sm:text-base">
          <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
            <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
              Company type
            </div>
            <div className="text-sm sm:text-base">IT Product</div>
          </div>

          <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
            <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
              Company address
            </div>
            <div className="text-right xl:text-left">
              <div className="pl-2 md:pl-0">
                <div className="inline-flex flex-wrap text-sm sm:text-base">
                  {company.address || "N/A"}
                  {company.address && company.city ? ", " : ""}
                  {company.city || ""}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
            <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
              Company size
            </div>
            <div className="text-sm sm:text-base">
              {company.companySize ? `${company.companySize} employees` : "N/A"}
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:pt-4 divide-y xl:divide-y-0 xl:divide-x divide-dotted mt-2 xl:mt-0 text-sm sm:text-base">
          <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
            <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
              Email
            </div>
            <div className="text-sm sm:text-base">{company.email || "N/A"}</div>
          </div>

          <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
            <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
              Working days
            </div>
            <div className="text-sm sm:text-base">
              {company.workingDays?.from && company.workingDays?.to
                ? `${company.workingDays.from} - ${company.workingDays.to}`
                : "N/A"}
            </div>
          </div>

          <div className="xl:w-1/3 flex flex-col justify-between py-2 xl:py-0 px-0 xl:px-4">
            <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
              Overtime policy
            </div>
            <div className="text-sm sm:text-base">
              {company.overtimePolicy || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {company.overview && (
        <div className="bg-white shadow-md rounded-2xl px-4 py-5 sm:px-5 sm:pt-6 sm:pb-8 mb-5 xl:px-6 xl:pb-8">
          <h2 className="border-b border-dashed pb-4 text-lg sm:text-xl font-semibold">
            Company overview
          </h2>
          <div className="pt-4 break-words prose prose-sm sm:prose max-w-none text-gray-700">
            {company.overview.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {(skills.length > 0 || company.description) && (
        <div className="bg-white shadow-md rounded-2xl px-4 py-5 sm:px-5 sm:pt-6 sm:pb-8 mb-5 xl:px-6 xl:pb-8">
          <h2 className="border-b border-dashed pb-4 text-lg sm:text-xl font-semibold">
            Our key skills & Description
          </h2>

          <div className="pt-4 break-words">
            {skills.length > 0 && (
              <>
                <div className="text-base sm:text-lg font-medium">
                  Skills We Use
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-full cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {company.description && (
              <div
                className={`pt-4 prose prose-sm sm:prose max-w-none text-gray-700 ${
                  skills.length > 0 ? "mt-4 border-t border-dashed pt-4" : ""
                }`}
              >
                <div className="text-base sm:text-lg font-medium mb-2">
                  Description
                </div>
                {company.description.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-2">
        <BlogIT />
      </div>
    </div>
  );
};

export default Company;
