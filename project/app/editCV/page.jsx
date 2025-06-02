"use client";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { FaSpinner } from "react-icons/fa";
import BASE_URL from "@/utils/config";

export default function EditCV() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const token = Cookies.get("authToken");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: skillsFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control, name: "skills" });

  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "languages" });

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/candidates/cv`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch CV");

        const result = await res.json();
        const cvData = result.structuredCV || {};

        const formatData = {
          summary: cvData.summary || "",
          education:
            cvData.education?.length > 0
              ? cvData.education.map((edu) => ({
                  ...edu,
                  startDate: edu.startDate?.split("T")[0] || "",
                  endDate: edu.endDate?.split("T")[0] || "",
                }))
              : [createNewEducation()],
          experience:
            cvData.experience?.length > 0
              ? cvData.experience.map((exp) => ({
                  ...exp,
                  startDate: exp.startDate?.split("T")[0] || "",
                  endDate: exp.endDate?.split("T")[0] || "",
                }))
              : [createNewExperience()],
          skills: cvData.skills?.length > 0 ? cvData.skills : [""],
          languages: cvData.languages?.length > 0 ? cvData.languages : [""],
        };

        reset(formatData);
      } catch (error) {
        console.error("Error fetching CV:", error);
        setMessage("Không thể tải dữ liệu CV");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCV();
  }, [reset, token]);

  const createNewEducation = () => ({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const createNewExperience = () => ({
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/candidates/cv`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save CV");

      setMessage("CV đã được lưu thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving CV:", err);
      setMessage("Lỗi khi lưu CV. Vui lòng thử lại.");
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl mb-4" />
        <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">CHỈNH SỬA CV</h1>
        <p className="text-gray-600">
          Cập nhật thông tin cá nhân và chuyên môn của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Summary Section */}
        <SectionCard title="Tóm tắt cá nhân">
          <TextAreaField
            label="Mô tả về bản thân và mục tiêu nghề nghiệp"
            placeholder="Ví dụ: Tôi là một kỹ sư phần mềm với 5 năm kinh nghiệm..."
            error={errors.summary}
            {...register("summary", {
              required: "Vui lòng nhập thông tin tóm tắt",
            })}
          />
        </SectionCard>

        {/* Education Section */}
        <SectionCard
          title="Học vấn"
          onAdd={() => appendEdu(createNewEducation())}
        >
          {eduFields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 relative group"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">
                  Trường học #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeEdu(index)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Tên trường*"
                  placeholder="Đại học ABC"
                  error={errors.education?.[index]?.school}
                  {...register(`education.${index}.school`, {
                    required: "Vui lòng nhập tên trường",
                  })}
                />

                <InputField
                  label="Bằng cấp"
                  placeholder="Cử nhân, Thạc sĩ..."
                  {...register(`education.${index}.degree`)}
                />

                <InputField
                  label="Chuyên ngành"
                  placeholder="Khoa học máy tính"
                  {...register(`education.${index}.fieldOfStudy`)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    type="date"
                    label="Ngày bắt đầu"
                    {...register(`education.${index}.startDate`)}
                  />
                  <InputField
                    type="date"
                    label="Ngày kết thúc"
                    {...register(`education.${index}.endDate`)}
                  />
                </div>

                <div className="col-span-full">
                  <TextAreaField
                    label="Mô tả thêm"
                    placeholder="Thành tích, dự án nổi bật..."
                    {...register(`education.${index}.description`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Experience Section */}
        <SectionCard
          title="Kinh nghiệm làm việc"
          onAdd={() => appendExp(createNewExperience())}
        >
          {expFields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 relative group"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">
                  Kinh nghiệm #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeExp(index)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Tên công ty*"
                  placeholder="Công ty ABC"
                  error={errors.experience?.[index]?.company}
                  {...register(`experience.${index}.company`, {
                    required: "Vui lòng nhập tên công ty",
                  })}
                />

                <InputField
                  label="Vị trí*"
                  placeholder="Kỹ sư phần mềm"
                  error={errors.experience?.[index]?.title}
                  {...register(`experience.${index}.title`, {
                    required: "Vui lòng nhập vị trí công việc",
                  })}
                />

                <InputField
                  label="Địa điểm"
                  placeholder="Hà Nội, Việt Nam"
                  {...register(`experience.${index}.location`)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    type="date"
                    label="Ngày bắt đầu"
                    {...register(`experience.${index}.startDate`)}
                  />
                  <InputField
                    type="date"
                    label="Ngày kết thúc"
                    {...register(`experience.${index}.endDate`)}
                  />
                </div>

                <div className="col-span-full">
                  <TextAreaField
                    label="Mô tả công việc"
                    placeholder="Trách nhiệm và thành tựu đạt được..."
                    {...register(`experience.${index}.description`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Skills Section */}
        <SectionCard title="Kỹ năng chuyên môn" onAdd={() => appendSkill("")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <InputField
                  placeholder="VD: Quản lý dự án..."
                  className="flex-1"
                  {...register(`skills.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="mt-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Languages Section */}
        <SectionCard title="Ngôn ngữ" onAdd={() => appendLang("")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {langFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <InputField
                  placeholder="VD: Tiếng Anh"
                  className="flex-1"
                  {...register(`languages.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => removeLang(index)}
                  className="mt-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Submit Button */}
        <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin text-white text-xl" />
              ) : (
                "LƯU CV"
              )}
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/viewCV")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              XEM TRƯỚC CV
            </button>
          </div>

          {message && (
            <div
              className={`mt-3 p-3 rounded-md text-center ${
                message.includes("thành công")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// Reusable Components
const SectionCard = ({ title, children, onAdd }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
        >
          <PlusCircle size={20} /> Thêm mới
        </button>
      )}
    </div>
    {children}
  </div>
);

const InputField = ({ label, type = "text", placeholder, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      className={`w-full px-4 py-2.5 border ${
        error ? "border-red-300" : "border-gray-300"
      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
      placeholder={placeholder}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);

const TextAreaField = ({ label, placeholder, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <textarea
      className={`w-full px-4 py-2.5 border ${
        error ? "border-red-300" : "border-gray-300"
      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
      rows={4}
      placeholder={placeholder}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);
