"use client";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import BASE_URL from "@/utils/config";

export default function CreateCV() {
  const [message, setMessage] = useState("");
  const token = Cookies.get("authToken");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      summary: "",
      education: [
        {
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      experience: [
        {
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      skills: [""],
      languages: [""],
    },
  });

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

      if (!res.ok) throw new Error("Lỗi khi lưu CV");

      setMessage("CV đã được lưu thành công!");
      reset();
    } catch (err) {
      console.error("Lỗi khi lưu CV:", err);
      setMessage("Có lỗi xảy ra khi lưu CV");
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white border border-red-200 shadow-xl rounded-xl p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-red-500 text-4xl">
              <i className="bi bi-lock-fill"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Bạn cần đăng nhập
            </h2>
            <p className="text-sm text-red-600">
              Vui lòng đăng nhập để tạo hoặc chỉnh sửa CV của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
        TẠO CV CỦA BẠN
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 p-1 rounded">
              <i className="bi bi-person-badge"></i>
            </span>
            Tóm Tắt Cá Nhân
          </h2>
          <textarea
            {...register("summary")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Mô tả kinh nghiệm, kỹ năng và mục tiêu nghề nghiệp của bạn..."
          />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 p-1 rounded">
                <i className="bi bi-mortarboard"></i>
              </span>
              Học Vấn
            </h2>
            <button
              type="button"
              onClick={() =>
                appendEdu({
                  school: "",
                  degree: "",
                  fieldOfStudy: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              <PlusCircle size={18} /> Thêm học vấn
            </button>
          </div>

          {eduFields.map((field, index) => (
            <div
              key={field.id}
              className="border-l-4 border-green-200 pl-4 mb-6 relative group bg-gray-50 p-4 rounded-md"
            >
              <button
                type="button"
                onClick={() => removeEdu(index)}
                className="absolute right-0 top-0 bg-red-100 p-1 rounded-bl-md text-red-600 hover:bg-red-200 transition-colors"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Trường học"
                  placeholder="Tên trường đại học/cao đẳng"
                  {...register(`education.${index}.school`)}
                />
                <InputField
                  label="Bằng cấp"
                  placeholder="Ví dụ: Cử nhân, Thạc sĩ..."
                  {...register(`education.${index}.degree`)}
                />
                <InputField
                  label="Chuyên ngành"
                  placeholder="Ví dụ: Công nghệ thông tin"
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
                <TextAreaField
                  label="Mô tả"
                  placeholder="Thành tích, dự án nổi bật..."
                  {...register(`education.${index}.description`)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Kinh nghiệm làm việc */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 p-1 rounded">
                <i className="bi bi-briefcase"></i>
              </span>
              Kinh Nghiệm Làm Việc
            </h2>
            <button
              type="button"
              onClick={() =>
                appendExp({
                  company: "",
                  title: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              <PlusCircle size={18} /> Thêm kinh nghiệm
            </button>
          </div>

          {expFields.map((field, index) => (
            <div
              key={field.id}
              className="border-l-4 border-purple-200 pl-4 mb-6 relative group bg-gray-50 p-4 rounded-md"
            >
              <button
                type="button"
                onClick={() => removeExp(index)}
                className="absolute right-0 top-0 bg-red-100 p-1 rounded-bl-md text-red-600 hover:bg-red-200 transition-colors"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Công ty"
                  placeholder="Tên công ty/tổ chức"
                  {...register(`experience.${index}.company`)}
                />
                <InputField
                  label="Vị trí"
                  placeholder="Ví dụ: Lập trình viên Front-end"
                  {...register(`experience.${index}.title`)}
                />
                <InputField
                  label="Địa điểm"
                  placeholder="Thành phố, quốc gia"
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
                <TextAreaField
                  label="Mô tả công việc"
                  placeholder="Nhiệm vụ, thành tựu đạt được..."
                  {...register(`experience.${index}.description`)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Kỹ năng */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 p-1 rounded">
                <i className="bi bi-tools"></i>
              </span>
              Kỹ Năng
            </h2>
            <button
              type="button"
              onClick={() => appendSkill("")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              <PlusCircle size={18} /> Thêm kỹ năng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillsFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <InputField
                  {...register(`skills.${index}`)}
                  placeholder="VD: Quản lý dự án..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="bg-red-100 text-red-800 p-1 rounded">
                <i className="bi bi-translate"></i>
              </span>
              Ngôn Ngữ
            </h2>
            <button
              type="button"
              onClick={() => appendLang("")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              <PlusCircle size={18} /> Thêm ngôn ngữ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {langFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <InputField
                  {...register(`languages.${index}`)}
                  placeholder="VD: Tiếng Anh"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeLang(index)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nút submit */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <i className="bi bi-save"></i> LƯU CV
              </>
            )}
          </button>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md text-center ${
                message.includes("thành công")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
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
const InputField = ({ label, type = "text", placeholder = "", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="text-sm font-medium text-gray-700">{label}</label>
    )}
    <input
      type={type}
      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      placeholder={placeholder}
      {...props}
    />
  </div>
);

const TextAreaField = ({ label, placeholder = "", ...props }) => (
  <div className="space-y-1 col-span-full">
    {label && (
      <label className="text-sm font-medium text-gray-700">{label}</label>
    )}
    <textarea
      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      rows={3}
      placeholder={placeholder}
      {...props}
    />
  </div>
);
