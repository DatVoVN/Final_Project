"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  HiOutlinePlus,
  HiOutlineInformationCircle,
  HiOutlineLocationMarker,
  HiCurrencyDollar,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineCode,
} from "react-icons/hi";
import { BiRadioCircle, BiRadioCircleMarked } from "react-icons/bi";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
const PostJobForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    experienceLevel: "",
    deadline: "",
    jobType: "",
    locationType: "Onsite",
    remote: false,
    salary: "",
    description: "",
    requirements: "",
    languagesInput: "",
    benefitsInput: "",
    vacancies: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = Cookies.get("token");
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError(null);
    setSuccess(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const languagesArray = formData.languagesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const benefitsArray = formData.benefitsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      salary: parseInt(formData.salary, 10),
      deadline: formData.deadline || undefined,
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      locationType: formData.locationType,
      remote: formData.remote,
      languages: languagesArray,
      benefits: benefitsArray,
      vacancies: parseInt(formData.vacancies, 10),
    };
    if (isNaN(payload.salary)) {
      setError("Mức lương phải là một con số.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/developer/job-postings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đã xảy ra lỗi khi đăng tin.");
      }

      setSuccess("Đăng tin tuyển dụng thành công!");

      setFormData({
        title: "",
        experienceLevel: "",
        deadline: "",
        jobType: "",
        locationType: "Onsite",
        remote: false,
        salary: "",
        description: "",
        requirements: "",
        languagesInput: "",
        benefitsInput: "",
        vacancies: "",
      });
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      toast.error("Bạn cần phải mua thêm gói để có thê đăng tin");
    } finally {
      setIsLoading(false);
    }
  };

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
    "Remote",
  ];
  const locationTypes = ["Onsite", "Hybrid", "Remote"];

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Đăng Tin Tuyển Dụng Mới
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiêu đề tin tuyển dụng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Tuyển dụng Lập trình viên Node.js (Junior)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="experienceLevel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cấp bậc / Kinh nghiệm <span className="text-red-500">*</span>
                </label>
                <select
                  name="experienceLevel"
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Chọn cấp bậc</option>
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
                  Loại hình công việc <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobType"
                  id="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Chọn loại hình</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="vacancies"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số lượng tuyển <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="vacancies"
                id="vacancies"
                value={formData.vacancies}
                onChange={handleChange}
                min="1"
                placeholder="VD: 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hạn nộp hồ sơ
              </label>
              <input
                type="date"
                name="deadline"
                id="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình thức làm việc <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
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
                      <BiRadioCircleMarked className="text-indigo-600 h-5 w-5 mr-1" />
                    ) : (
                      <BiRadioCircle className="text-gray-400 h-5 w-5 mr-1" />
                    )}
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
              {formData.locationType === "Remote" && (
                <input type="hidden" name="remote" value="true" />
              )}
              {formData.locationType !== "Remote" && (
                <input type="hidden" name="remote" value="false" />
              )}
            </div>

            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mức lương (Triệu VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                  <HiCurrencyDollar className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  placeholder="Nhập mức lương bằng số, VD: 2"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về công việc..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-vertical"
                required
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Yêu cầu công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                id="requirements"
                rows={5}
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Nhập các yêu cầu đối với ứng viên..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-vertical"
                required
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="languagesInput"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
              >
                <HiOutlineCode className="h-4 w-4" /> Kỹ năng yêu cầu (Mỗi kỹ
                năng một dòng)
              </label>
              <textarea
                name="languagesInput"
                id="languagesInput"
                rows={4}
                value={formData.languagesInput}
                onChange={handleChange}
                placeholder="Node.js
MongoDB
Express.js
Docker"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-vertical"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="benefitsInput"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
              >
                <HiOutlineSparkles className="h-4 w-4" /> Quyền lợi (Mỗi quyền
                lợi một dòng)
              </label>
              <textarea
                name="benefitsInput"
                id="benefitsInput"
                rows={4}
                value={formData.benefitsInput}
                onChange={handleChange}
                placeholder="Bảo hiểm đầy đủ theo luật lao động
Làm việc hybrid linh hoạt
Teambuilding hàng quý, du lịch hàng năm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-vertical"
              ></textarea>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 bg-green-100 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 sticky bottom-0">
          <div className="flex justify-end items-center gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Đang đăng..." : "Đăng tin"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostJobForm;
