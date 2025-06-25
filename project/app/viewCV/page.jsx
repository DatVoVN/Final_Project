"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Cookies from "js-cookie";
import { FaSpinner, FaFilePdf, FaEdit } from "react-icons/fa";
import autoTable from "jspdf-autotable";
import BASE_URL from "@/utils/config";
import "@/fonts/Roboto-Regular-normal";
const ViewCV = () => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("authToken");

  const formatDate = (date) => {
    if (!date) return "Chưa cập nhật";
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
    if (!cvData) return;

    const doc = new jsPDF();
    doc.setFont("Roboto-Regular", "normal");
    // doc.setFont("helvetica", "normal");

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    doc.setFontSize(24);
    doc.setTextColor(40, 53, 147);
    doc.text("HỒ SƠ CÁ NHÂN", pageWidth / 2, y, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Tạo ngày: ${new Date().toLocaleDateString("vi-VN")}`,
      pageWidth / 2,
      y + 10,
      { align: "center" }
    );
    y += 25;

    // Tóm tắt
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("TÓM TẮT", 20, (y += 10));

    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(
      cvData.summary || "Chưa có thông tin tóm tắt",
      170
    );
    doc.text(summaryLines, 20, y + 10);
    y += summaryLines.length * 7 + 15;
    if (cvData.education?.length > 0) {
      doc.setFontSize(16);
      doc.text("HỌC VẤN", 20, y);

      const eduData = cvData.education.map((edu) => [
        edu.school || "Chưa cập nhật",
        edu.degree || "",
        edu.fieldOfStudy || "",
        `${formatDate(edu.startDate)} - ${
          edu.endDate ? formatDate(edu.endDate) : "Hiện tại"
        }`,
      ]);

      autoTable(doc, {
        startY: y + 5,
        head: [["Trường học", "Bằng cấp", "Chuyên ngành", "Thời gian"]],
        body: eduData,
        styles: {
          font: "Roboto-Regular",
          fontStyle: "normal",
          fontSize: 10,
          cellPadding: 3,
          textColor: [55, 65, 81],
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "normal",
        },
        theme: "grid",
        margin: { left: 20, right: 20 },
      });

      y = doc.lastAutoTable.finalY + 10;
    }
    if (cvData.experience?.length > 0) {
      doc.setFontSize(16);
      doc.text("KINH NGHIỆM LÀM VIỆC", 20, y);

      const expData = cvData.experience.map((exp) => [
        exp.company || "Chưa cập nhật",
        exp.title || "",
        exp.location || "",
        `${formatDate(exp.startDate)} - ${
          exp.endDate ? formatDate(exp.endDate) : "Hiện tại"
        }`,
      ]);

      autoTable(doc, {
        startY: y + 5,
        head: [["Công ty", "Vị trí", "Địa điểm", "Thời gian"]],
        body: expData,
        styles: {
          font: "Roboto-Regular",
          fontStyle: "normal",
          fontSize: 10,
          cellPadding: 3,
          textColor: [55, 65, 81],
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "normal",
        },
        theme: "grid",
        margin: { left: 20, right: 20 },
      });

      y = doc.lastAutoTable.finalY + 10;
    }
    if (cvData.skills?.length > 0) {
      doc.setFontSize(16);
      doc.text("KỸ NĂNG", 20, y);

      doc.setFontSize(12);
      const skillsText = doc.splitTextToSize(
        cvData.skills.join(", ") || "Chưa có kỹ năng",
        170
      );
      doc.text(skillsText, 20, y + 10);
      y += skillsText.length * 7 + 15;
    }
    if (cvData.languages?.length > 0) {
      doc.setFontSize(16);
      doc.text("NGÔN NGỮ", 20, y);

      doc.setFontSize(12);
      const langText = doc.splitTextToSize(
        cvData.languages.join(", ") || "Chưa có ngôn ngữ",
        170
      );
      doc.text(langText, 20, y + 10);
    }
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Trang ${i}/${pageCount}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    doc.save("ho-so-ca-nhan.pdf");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl mb-4" />
        <p className="text-gray-600 text-lg">Đang tải dữ liệu CV...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">HỒ SƠ CÁ NHÂN</h1>
        <p className="text-gray-600">Xem và quản lý hồ sơ cá nhân của bạn</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => (window.location.href = "/editCV")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <FaEdit /> Chỉnh sửa CV
        </button>
        <button
          onClick={generatePDF}
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <FaFilePdf /> Xuất PDF
        </button>
      </div>

      {cvData ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Tóm tắt bản thân
            </h2>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {cvData.summary || "Chưa có thông tin tóm tắt"}
            </p>
          </div>
          {cvData.education && cvData.education.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Học vấn</h2>
              <div className="space-y-5">
                {cvData.education.map((edu) => (
                  <div
                    key={edu._id}
                    className="border-l-4 border-indigo-300 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                  >
                    <div className="flex justify-between flex-wrap">
                      <h3 className="text-lg font-medium text-gray-800">
                        {edu.school || "Chưa cập nhật trường học"}
                        {edu.degree && (
                          <span className="text-gray-500"> ({edu.degree})</span>
                        )}
                      </h3>
                      <div className="text-sm text-indigo-600 font-medium">
                        {edu.startDate ? (
                          <>
                            <span>{formatDate(edu.startDate)}</span>
                            <span> - </span>
                            <span>
                              {edu.endDate
                                ? formatDate(edu.endDate)
                                : "Hiện tại"}
                            </span>
                          </>
                        ) : (
                          <span>Chưa cập nhật thời gian</span>
                        )}
                      </div>
                    </div>

                    {edu.fieldOfStudy && (
                      <p className="text-gray-600 mt-1">{edu.fieldOfStudy}</p>
                    )}

                    {edu.description && (
                      <p className="text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cvData.experience && cvData.experience.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Kinh nghiệm làm việc
              </h2>
              <div className="space-y-5">
                {cvData.experience.map((exp) => (
                  <div
                    key={exp._id}
                    className="border-l-4 border-indigo-300 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                  >
                    <div className="flex justify-between flex-wrap">
                      <h3 className="text-lg font-medium text-gray-800">
                        {exp.company || "Chưa cập nhật công ty"}
                        {exp.title && (
                          <span className="text-gray-500"> ({exp.title})</span>
                        )}
                      </h3>
                      <div className="text-sm text-indigo-600 font-medium">
                        {exp.startDate ? (
                          <>
                            <span>{formatDate(exp.startDate)}</span>
                            <span> - </span>
                            <span>
                              {exp.endDate
                                ? formatDate(exp.endDate)
                                : "Hiện tại"}
                            </span>
                          </>
                        ) : (
                          <span>Chưa cập nhật thời gian</span>
                        )}
                      </div>
                    </div>

                    {exp.location && (
                      <p className="text-gray-600 mt-1">{exp.location}</p>
                    )}

                    {exp.description && (
                      <p className="text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.skills && cvData.skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Kỹ năng</h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ngôn ngữ</h2>
              <div className="flex flex-wrap gap-2">
                {cvData.languages.map((language, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(!cvData.education || cvData.education.length === 0) &&
            (!cvData.experience || cvData.experience.length === 0) &&
            (!cvData.skills || cvData.skills.length === 0) &&
            (!cvData.languages || cvData.languages.length === 0) && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-3">
                  Hồ sơ của bạn đang trống
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn chưa thêm thông tin vào hồ sơ cá nhân. Hãy bắt đầu bằng
                  cách chỉnh sửa CV.
                </p>
                <button
                  onClick={() => (window.location.href = "/editCV")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-colors font-medium"
                >
                  Chỉnh sửa CV ngay
                </button>
              </div>
            )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-3">
            Không tìm thấy hồ sơ
          </h3>
          <p className="text-gray-600 mb-4">
            Bạn chưa tạo hồ sơ cá nhân. Hãy bắt đầu bằng cách chỉnh sửa CV.
          </p>
          <button
            onClick={() => (window.location.href = "/editCV")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-colors font-medium"
          >
            Tạo CV ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewCV;
