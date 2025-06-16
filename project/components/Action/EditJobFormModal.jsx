import React, { useState, useEffect } from "react";
import BASE_URL from "@/utils/config";
import {
  HiOutlineCode,
  HiCurrencyDollar,
  HiOutlineSparkles,
  HiX,
} from "react-icons/hi";
import { BiRadioCircle, BiRadioCircleMarked } from "react-icons/bi";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
const EditJobFormModal = ({ job, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = Cookies.get("token");
  useEffect(() => {
    if (job) {
      const deadlineDate = job.deadline
        ? new Date(job.deadline).toISOString().split("T")[0]
        : "";
      setFormData({
        title: job.title || "",
        experienceLevel: job.experienceLevel || "",
        deadline: deadlineDate,
        jobType: job.jobType || "",
        locationType: job.locationType || "Onsite",
        remote: job.remote || false,
        salary: job.salary || "",
        description: job.description || "",
        requirements: job.requirements || "",
        languagesInput: job.languages?.join("\n") || "",
        benefitsInput: job.benefits?.join("\n") || "",
      });
    }
  }, [job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const languagesArray = formData.languagesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const benefitsArray = formData.benefitsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const { languagesInput, benefitsInput, ...dataToSend } = formData;
    const updatedJobData = {
      ...dataToSend,
      languages: languagesArray,
      benefits: benefitsArray,
    };
    if (!token) {
      setError("Token không hợp lệ hoặc chưa được xác thực.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/developer/jobs/${job._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedJobData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Lỗi không xác định." }));
        throw new Error(errorData.message || `Lỗi ${response.status}`);
      }

      const responseData = await response.json();
      toast.success("Cập nhật công việc thành công!");

      if (onUpdated) onUpdated();
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
      toast.error(`Cập nhật thất bại`);
    } finally {
      setIsLoading(false);
    }
  };

  const locationTypes = ["Onsite", "Hybrid", "Remote"];
  const experienceLevels = [
    "Intern",
    "Fresher",
    "Junior",
    "Mid",
    "Senior",
    "Lead",
  ];
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "locationType") {
      setFormData((prev) => ({
        ...prev,
        locationType: value,
        remote: value === "Remote",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };
  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Chỉnh sửa công việc
          </h2>
          <button
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            onClick={onClose}
            title="Đóng"
            disabled={isLoading}
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto flex-grow">
          <form
            onSubmit={handleSubmit}
            id="edit-job-form-inside-modal"
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                placeholder="VD: Lập trình viên ReactJS"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label
                  htmlFor="experienceLevel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cấp bậc
                </label>
                <select
                  name="experienceLevel"
                  id="experienceLevel"
                  value={formData.experienceLevel || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">-- Chọn --</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="jobType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loại hình
                </label>
                <select
                  name="jobType"
                  id="jobType"
                  value={formData.jobType || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">-- Chọn --</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hạn nộp hồ sơ
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mức lương (Triệu VNĐ/Tháng)
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder="Để trống nếu thỏa thuận"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình thức làm việc
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {locationTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="locationType"
                      value={type}
                      checked={formData.locationType === type}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {formData.locationType === type ? (
                      <BiRadioCircleMarked className="text-indigo-600 h-5 w-5 mr-1.5" />
                    ) : (
                      <BiRadioCircle className="text-gray-400 h-5 w-5 mr-1.5" />
                    )}
                    <span className="text-sm text-gray-800">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả công việc
              </label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Chi tiết về nhiệm vụ, trách nhiệm..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Yêu cầu ứng viên
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows="5"
                value={formData.requirements || ""}
                onChange={handleChange}
                placeholder="Kỹ năng cứng, kỹ năng mềm, kinh nghiệm..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="languagesInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kỹ năng/Công nghệ (mỗi mục một dòng)
              </label>
              <textarea
                id="languagesInput"
                name="languagesInput"
                rows="4"
                value={formData.languagesInput || ""}
                onChange={handleChange}
                placeholder="VD:
ReactJS
Node.js
MongoDB"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="benefitsInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quyền lợi & Phúc lợi (mỗi mục một dòng)
              </label>
              <textarea
                id="benefitsInput"
                name="benefitsInput"
                rows="4"
                value={formData.benefitsInput || ""}
                onChange={handleChange}
                placeholder="VD:
Lương tháng 13
Bảo hiểm X Y Z
Du lịch hàng năm"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-4 mt-4">
                <p className="text-sm font-medium text-red-800">Lỗi: {error}</p>
              </div>
            )}
          </form>
        </div>{" "}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            type="submit"
            form="edit-job-form-inside-modal"
            disabled={isLoading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EditJobFormModal;
