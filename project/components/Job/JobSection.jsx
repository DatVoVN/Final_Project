// components/JobSection.jsx
import React from "react";

const JobSection = ({ title, htmlContent, listItems }) => {
  if (!htmlContent && (!listItems || listItems.length === 0)) {
    return null;
  }

  return (
    <div className="prose prose-sm max-w-none mb-6">
      <h2 className="text-xl font-semibold pt-4 pb-2">{title}</h2>
      {htmlContent && (
        <div
          className="text-sm break-words text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: htmlContent.replace(/\n/g, "<br />"),
          }}
        ></div>
      )}
      {listItems && listItems.length > 0 && (
        <ul className="list-disc pl-5 text-sm break-words text-gray-700 leading-relaxed space-y-1">
          {listItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobSection;
