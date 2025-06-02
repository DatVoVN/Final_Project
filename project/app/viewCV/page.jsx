"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import Cookies from "js-cookie";
import { FaSpinner } from "react-icons/fa";
import autoTable from "jspdf-autotable";
import BASE_URL from "@/utils/config";
const ViewCV = () => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("authToken");
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };
  useEffect(() => {
    const fetchCV = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/candidates/cv`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch CV");

        const data = await res.json();
        setCvData(data.structuredCV);
      } catch (error) {
        console.error("Error fetching CV:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, []);
  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("times", "normal");
    doc.setFontSize(22);
    doc.text("Curriculum Vitae", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(16);
    doc.text("Summary", 20, (y += 10));
    doc.setFontSize(12);
    doc.text(
      doc.splitTextToSize(cvData.summary || "No summary", 170),
      20,
      (y += 10)
    );

    // Education Table
    doc.setFontSize(16);
    doc.text("Education", 20, (y += 20));
    autoTable(doc, {
      startY: y + 5,
      head: [["School", "Degree", "Field", "From - To"]],
      body: cvData.education.map((edu) => [
        edu.school,
        edu.degree,
        edu.fieldOfStudy,
        `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`,
      ]),
      styles: { fontSize: 11 },
      theme: "striped",
      margin: { left: 20, right: 20 },
    });
    y = doc.lastAutoTable.finalY;

    // Experience Table
    doc.setFontSize(16);
    doc.text("Experience", 20, (y += 15));
    autoTable(doc, {
      startY: y + 5,
      head: [["Company", "Title", "Location", "From - To"]],
      body: cvData.experience.map((exp) => [
        exp.company,
        exp.title,
        exp.location,
        `${exp.startDate} - ${exp.endDate}`,
      ]),
      styles: { fontSize: 11 },
      theme: "striped",
      margin: { left: 20, right: 20 },
    });
    y = doc.lastAutoTable.finalY;

    // Skills
    doc.setFontSize(16);
    doc.text("Skills", 20, (y += 15));
    doc.setFontSize(12);
    doc.text(
      doc.splitTextToSize(cvData.skills.join(", ") || "None", 170),
      20,
      (y += 10)
    );

    // Languages
    doc.setFontSize(16);
    doc.text("Languages", 20, (y += 15));
    doc.setFontSize(12);
    doc.text(
      doc.splitTextToSize(cvData.languages.join(", ") || "None", 170),
      20,
      (y += 10)
    );

    doc.save("cv.pdf");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaSpinner className="animate-spin text-indigo-500 text-4xl mb-4" />
        <p className="text-slate-600">Đang tải bài viết...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-9 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex justify-center">
        XEM CV
      </h1>

      {cvData ? (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Tóm tắt bản thân
            </h2>
            <p className="text-gray-600 leading-relaxed">{cvData.summary}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Học vấn
            </h2>
            <div className="space-y-6">
              {cvData.education.map((edu) => (
                <div key={edu._id} className="border-l-4 border-blue-200 pl-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-800">
                      {edu.school || "Chưa cập nhật trường học"}
                      {edu.degree && (
                        <span className="text-gray-500"> ({edu.degree})</span>
                      )}
                    </h3>
                    {edu.fieldOfStudy && (
                      <p className="text-gray-600">{edu.fieldOfStudy}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {edu.startDate ? (
                        <>
                          <span>
                            {new Date(edu.startDate).toLocaleDateString()}
                          </span>
                          <span>-</span>
                          <span>
                            {edu.endDate
                              ? new Date(edu.endDate).toLocaleDateString()
                              : "Hiện tại"}
                          </span>
                        </>
                      ) : (
                        <span>Chưa cập nhật thời gian</span>
                      )}
                    </div>
                    {edu.description && (
                      <p className="text-gray-600 mt-2">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Kinh nghiệm làm việc
            </h2>
            <div className="space-y-6">
              {cvData.experience.map((exp) => (
                <div key={exp._id} className="border-l-4 border-blue-200 pl-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-800">
                      {exp.company || "Chưa cập nhật công ty"}
                      {exp.title && (
                        <span className="text-gray-500"> ({exp.title})</span>
                      )}
                    </h3>
                    {exp.location && (
                      <p className="text-gray-600">{exp.location}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {exp.startDate ? (
                        <>
                          <span>
                            {new Date(exp.startDate).toLocaleDateString()}
                          </span>
                          <span>-</span>
                          <span>
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString()
                              : "Hiện tại"}
                          </span>
                        </>
                      ) : (
                        <span>Chưa cập nhật thời gian</span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 mt-2">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Kỹ năng
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Ngôn ngữ
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => (window.location.href = "/editCV")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition-colors font-medium"
            >
              Chỉnh sửa CV
            </button>
            <button
              onClick={generatePDF}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md transition-colors font-medium"
            >
              Xuất PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-600">Không tìm thấy CV</p>
        </div>
      )}
    </div>
  );
};

export default ViewCV;
