import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  HiX,
  HiCalendar,
  HiCurrencyDollar,
  HiCode,
  HiLightBulb,
  HiOfficeBuilding,
} from "react-icons/hi";
import BASE_URL from "@/utils/config";
const JobDetailModal = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      const token = Cookies.get("token");
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/api/v1/developer/jobs/${jobId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Không thể tải thông tin công việc.");
        const data = await res.json();
        setJob(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJob();
  }, [jobId]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const DetailSection = ({ icon, title, children }) => (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center mb-2 text-indigo-700">
        {icon}
        <h3 className="ml-2 font-bold text-base">{title}</h3>
      </div>
      <div className="ml-6 text-gray-700">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-modal-appear">
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Chi tiết công việc
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-auto flex-grow">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <p className="text-gray-500">Đang tải thông tin...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center">
                <span className="mr-2">❌</span>
                <p>{error}</p>
              </div>
            ) : (
              job && (
                <div className="space-y-6">
                  <div className="border-b pb-4 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        <HiCalendar className="mr-1" />
                        {formatDate(job.deadline)}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                        <HiCurrencyDollar className="mr-1" />
                        {job.salary} triệu VNĐ/tháng
                      </span>
                    </div>
                  </div>

                  <DetailSection
                    icon={<HiLightBulb className="h-5 w-5" />}
                    title="Mô tả công việc"
                  >
                    <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.description}
                    </p>
                  </DetailSection>

                  <DetailSection
                    icon={<HiLightBulb className="h-5 w-5" />}
                    title="Yêu cầu"
                  >
                    <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.requirements}
                    </p>
                  </DetailSection>
                  <DetailSection
                    icon={<HiLightBulb className="h-5 w-5" />}
                    title="Loại hình"
                  >
                    <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.jobType}
                    </p>
                  </DetailSection>
                  <DetailSection
                    icon={<HiLightBulb className="h-5 w-5" />}
                    title="Trình độ"
                  >
                    <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.experienceLevel}
                    </p>
                  </DetailSection>
                  <DetailSection
                    icon={<HiLightBulb className="h-5 w-5" />}
                    title="Số lượng tuyển"
                  >
                    <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.vacancies}
                    </p>
                  </DetailSection>
                  <DetailSection
                    icon={<HiCode className="h-5 w-5" />}
                    title="Công nghệ"
                  >
                    <div className="flex flex-wrap gap-2 mt-1">
                      {job.languages.map((lang, i) => (
                        <span
                          key={i}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </DetailSection>

                  <DetailSection
                    icon={<HiLightBulb className="h-5 w-5" />}
                    title="Phúc lợi"
                  >
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {job.benefits.map((b, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </DetailSection>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default JobDetailModal;
