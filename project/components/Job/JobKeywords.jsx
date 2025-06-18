// components/JobKeywords.jsx
import React from "react";
import Link from "next/link";

const JobKeywords = ({ job, company }) => {
  const hasKeywords = job?.languages && job.languages.length > 0;
  if (!hasKeywords && !company) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold pt-4 pb-2">Từ khoá</h2>
      <div className="flex flex-wrap gap-2">
        {job?.languages?.map((tag) => (
          <Link
            key={tag}
            className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            href={`#`}
          >
            {tag}
          </Link>
        ))}
        <Link
          className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          href={`/jobs/location/${company?.city?.toLowerCase() || "all"}`}
        >
          Việc làm {company?.city || ""}
        </Link>
        {company && (
          <Link
            className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            href={`/company/detail/${company._id}`}
          >
            {company.name}
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobKeywords;
