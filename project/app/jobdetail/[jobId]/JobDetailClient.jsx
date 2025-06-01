"use client";

import React, { useRef, useState } from "react";
import JobHeaderCard from "@/components/Job/JobHeaderCard";
import JobGeneralInfo from "@/components/Job/JobGeneralInfo";
import JobSection from "@/components/Job/JobSection";
import JobActions from "@/components/Job/JobActions";
import JobKeywords from "@/components/Job/JobKeywords";
import CompanyInfoBox from "@/components/Job/CompanyInfoBox";
import JobLocation from "@/components/Job/JobLocation";

const JobDetailClient = ({ job }) => {
  const company = job.company;
  const [activeTab, setActiveTab] = useState("job");
  const jobDetailRef = useRef(null);
  const companyInfoRef = useRef(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const targetRef = tab === "job" ? jobDetailRef : companyInfoRef;
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <JobHeaderCard job={job} company={company} />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full">
          <div className="flex mb-[-1px] z-10">
            <div
              className={`w-1/2 text-base font-semibold p-3.5 cursor-pointer text-center border-b-2 ${
                activeTab === "job"
                  ? "bg-white text-indigo-600 border-indigo-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-transparent"
              }`}
              onClick={() => handleTabClick("job")}
            >
              Chi tiết tuyển dụng
            </div>
            <div
              className={`w-1/2 text-base font-semibold p-3.5 cursor-pointer text-center border-b-2 ${
                activeTab === "company"
                  ? "bg-white text-indigo-600 border-indigo-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-transparent"
              }`}
              onClick={() => handleTabClick("company")}
            >
              Công ty
            </div>
          </div>
          <div
            ref={jobDetailRef}
            className="px-4 md:px-8 py-6 bg-white shadow-md rounded-b-md border border-t-0 border-gray-200 p-5 mt-10"
          >
            <div className="mt-10 pt-5">
              <JobGeneralInfo job={job} />
              <JobSection
                title="Mô tả công việc"
                htmlContent={job.description}
              />
              <JobSection
                title="Yêu cầu công việc"
                htmlContent={job.requirements}
              />
              <JobSection title="Quyền lợi" listItems={job.benefits} />
              <JobLocation company={company} />
              <JobKeywords job={job} company={company} />
              <JobActions jobId={job._id} />
            </div>
          </div>

          <div className="p-5 mt-10" ref={companyInfoRef}>
            <div className="mt-10 pt-5">
              <CompanyInfoBox company={company} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailClient;
