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

      if (!res.ok) throw new Error("Failed to save CV");

      setMessage("CV saved successfully!");
      reset();
    } catch (err) {
      console.error("Lỗi khi lưu CV:", err);
      setMessage("Failed to save CV.");
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
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex justify-center">
        CREATE YOUR CV
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Summary
          </h2>
          <textarea
            {...register("summary")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Describe your professional background and skills..."
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Education</h2>
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
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <PlusCircle size={18} /> Add Education
            </button>
          </div>

          {eduFields.map((field, index) => (
            <div
              key={field.id}
              className="border-l-4 border-blue-200 pl-4 mb-6 relative group"
            >
              <button
                type="button"
                onClick={() => removeEdu(index)}
                className="absolute -right-2 -top-2 bg-red-100 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="School"
                  {...register(`education.${index}.school`)}
                />
                <InputField
                  label="Degree"
                  {...register(`education.${index}.degree`)}
                />
                <InputField
                  label="Field of Study"
                  {...register(`education.${index}.fieldOfStudy`)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    type="date"
                    label="Start Date"
                    {...register(`education.${index}.startDate`)}
                  />
                  <InputField
                    type="date"
                    label="End Date"
                    {...register(`education.${index}.endDate`)}
                  />
                </div>
                <TextAreaField
                  label="Description"
                  {...register(`education.${index}.description`)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Work Experience
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
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <PlusCircle size={18} /> Add Experience
            </button>
          </div>

          {expFields.map((field, index) => (
            <div
              key={field.id}
              className="border-l-4 border-blue-200 pl-4 mb-6 relative group"
            >
              <button
                type="button"
                onClick={() => removeExp(index)}
                className="absolute -right-2 -top-2 bg-red-100 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Company"
                  {...register(`experience.${index}.company`)}
                />
                <InputField
                  label="Job Title"
                  {...register(`experience.${index}.title`)}
                />
                <InputField
                  label="Location"
                  {...register(`experience.${index}.location`)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    type="date"
                    label="Start Date"
                    {...register(`experience.${index}.startDate`)}
                  />
                  <InputField
                    type="date"
                    label="End Date"
                    {...register(`experience.${index}.endDate`)}
                  />
                </div>
                <TextAreaField
                  label="Job Description"
                  {...register(`experience.${index}.description`)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
            <button
              type="button"
              onClick={() => appendSkill("")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <PlusCircle size={18} /> Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <InputField
                  {...register(`skills.${index}`)}
                  placeholder="e.g. Work group, Friendly..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Languages</h2>
            <button
              type="button"
              onClick={() => appendLang("")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <PlusCircle size={18} /> Add Language
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {langFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <InputField
                  {...register(`languages.${index}`)}
                  placeholder="e.g. C++, ReactJS"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeLang(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all font-semibold flex items-center justify-center gap-2"
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
              "Save CV"
            )}
          </button>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md ${
                message.includes("success")
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

const InputField = ({ label, type = "text", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="text-sm font-medium text-gray-700">{label}</label>
    )}
    <input
      type={type}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    />
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div className="space-y-1 col-span-full">
    {label && (
      <label className="text-sm font-medium text-gray-700">{label}</label>
    )}
    <textarea
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      rows={3}
      {...props}
    />
  </div>
);
