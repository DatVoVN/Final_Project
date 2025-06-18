import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
import { FaSpinner } from "react-icons/fa";
const RequiredLabel = ({ label }) => (
  <>
    {label} <span className="text-red-500">*</span>
  </>
);
const formatDateTimeVN = (isoString, withTime = false) => {
  if (!isoString) return "Không có dữ liệu";
  const date = new Date(isoString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};
const Me = () => {
  const [developer, setDeveloper] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDev, setEditingDev] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [initialDevData, setInitialDevData] = useState(null);
  const [initialCompanyData, setInitialCompanyData] = useState(null);
  const [devForm, setDevForm] = useState({ fullName: "", phoneNumber: "" });
  const [companyForm, setCompanyForm] = useState({
    email: "",
    address: "",
    description: "",
    overview: "",
    companySize: "",
    overtimePolicy: "",
    languages: "",
    workingFrom: "",
    workingTo: "",
    avatar: null,
    avatarPreview: null,
    currentAvatarUrl: null,
  });
  const weekdayOptions = [
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
    "Chủ Nhật",
  ];
  const [changePasswordForm, setChangePasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const token = Cookies.get("token");
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      setError("Vui lòng đăng nhập");
      setLoading(false);
      toast.error("Bạn cần phải đăng nhập");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/developer/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Request failed with status: ${res.status}`);
      const data = await res.json();
      const devData = data.data;
      const companyData = devData.company || {};

      setDeveloper(devData);
      setCompany(companyData);

      const initialDev = {
        fullName: devData.fullName || "",
        phoneNumber: devData.phoneNumber || "",
      };

      const initialCompany = {
        email: companyData.email || "",
        address: companyData.address || "",
        description: companyData.description || "",
        overview: companyData.overview || "",
        companySize: companyData.companySize || "",
        overtimePolicy: companyData.overtimePolicy || "",
        languages: companyData.languages?.join(", ") || "",
        workingFrom: companyData.workingDays?.from || "",
        workingTo: companyData.workingDays?.to || "",
        avatar: null,
        avatarPreview: null,
        currentAvatarUrl: companyData.avatarUrl || null,
      };

      setInitialDevData(initialDev);
      setInitialCompanyData(initialCompany);
      setDevForm(initialDev);
      setCompanyForm(initialCompany);
    } catch (err) {
      setError(err.message || "Lỗi khi lấy dữ liệu từ API");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleDevChange = (e) => {
    setDevForm({ ...devForm, [e.target.name]: e.target.value });
  };
  const handleCompanyChange = (e) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (companyForm.avatarPreview) {
      URL.revokeObjectURL(companyForm.avatarPreview);
    }
    if (file && file instanceof File) {
      setCompanyForm({
        ...companyForm,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    } else {
      setCompanyForm({ ...companyForm, avatar: null, avatarPreview: null });
    }
  };
  const handleDevUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/developer/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(devForm),
      });

      if (!res.ok) throw new Error(`Update failed with status: ${res.status}`);
      const data = await res.json();
      const updatedDevData = data.data;

      toast.success("Cập nhật thành công");
      setDeveloper(updatedDevData);
      setInitialDevData({
        fullName: updatedDevData.fullName || "",
        phoneNumber: updatedDevData.phoneNumber || "",
      });
      setEditingDev(false);
    } catch (err) {
      const message = err.message || "Cập nhật thất bại";
      setError(message);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", companyForm.email);
      formData.append("address", companyForm.address);
      formData.append("description", companyForm.description);
      formData.append("overview", companyForm.overview);
      formData.append("companySize", companyForm.companySize);
      formData.append("overtimePolicy", companyForm.overtimePolicy);

      companyForm.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang)
        .forEach((lang) => formData.append("languages", lang));

      formData.append(
        "workingDays",
        JSON.stringify({
          from: companyForm.workingFrom,
          to: companyForm.workingTo,
        })
      );

      if (companyForm.avatar) {
        formData.append("avatarUrl", companyForm.avatar);
      }

      const res = await fetch(`${BASE_URL}/api/v1/developer/my-company`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok)
        throw new Error(`Company update failed with status: ${res.status}`);
      const data = await res.json();
      const updatedCompanyData = data.data;

      toast.success("Cập nhật công ty thành công");
      setCompany(updatedCompanyData);
      if (companyForm.avatarPreview) {
        URL.revokeObjectURL(companyForm.avatarPreview);
      }

      const newInitial = {
        email: updatedCompanyData.email || "",
        address: updatedCompanyData.address || "",
        description: updatedCompanyData.description || "",
        overview: updatedCompanyData.overview || "",
        companySize: updatedCompanyData.companySize || "",
        overtimePolicy: updatedCompanyData.overtimePolicy || "",
        languages: updatedCompanyData.languages?.join(", ") || "",
        workingFrom: updatedCompanyData.workingDays?.from || "",
        workingTo: updatedCompanyData.workingDays?.to || "",
        avatar: null,
        avatarPreview: null,
        currentAvatarUrl: updatedCompanyData.avatarUrl || null,
      };

      setInitialCompanyData(newInitial);
      setCompanyForm(newInitial);
      setEditingCompany(false);
    } catch (err) {
      const message = err.message || "Cập nhật công ty thất bại";
      setError(message);
      toast.error("Cập nhật công ty thất bại: " + message);
    }
  };

  const cancelDevEdit = () => {
    setDevForm(initialDevData);
    setEditingDev(false);
    setError(null);
  };
  const cancelCompanyEdit = () => {
    if (companyForm.avatarPreview) {
      URL.revokeObjectURL(companyForm.avatarPreview);
    }
    setCompanyForm(initialCompanyData);
    setEditingCompany(false);
    setError(null);
  };
  const renderInfoField = (label, value) => (
    <div className="mb-4">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {value || (
          <span className="italic text-gray-500">Chưa có thông tin</span>
        )}
      </dd>
    </div>
  );
  const renderStyledInputField = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    isNumber = false,
  }) => (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {required ? <RequiredLabel label={label} /> : label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `VD: ${label}...`}
        required={required}
        className={`block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm
                   text-sm text-gray-900 placeholder-gray-400
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                   transition duration-150 ease-in-out
                   ${isNumber ? "text-right" : ""} `}
      />
    </div>
  );
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = changePasswordForm;

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/change-passwordE`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Mật khẩu cũ không đúng.");
      }

      toast.success(data.message || "Đổi mật khẩu thành công");

      setChangePasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message || "Đổi mật khẩu thất bại, vui lòng thử lại");
    }
  };

  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setChangePasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderStyledTextareaField = ({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    required = false,
    rows = 4,
  }) => (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {required ? <RequiredLabel label={label} /> : label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Nhập ${label.toLowerCase()}...`}
        required={required}
        className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
      />
    </div>
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaSpinner className="animate-spin text-indigo-500 text-4xl mb-4" />
        <p className="text-slate-600">Đang tải thông tin...</p>
      </div>
    );

  if (error && !developer && !company)
    return (
      <div className="flex justify-center items-center py-20 text-center bg-gray-50 min-h-screen">
        <p className="text-red-600 max-w-md">{error}</p>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        {error && (developer || company) && (
          <div
            className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Thông tin Tài khoản
          </h1>
        </div>
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-indigo-500" />
              Thông tin Cá nhân
            </h2>
            {!editingDev && developer && (
              <button
                onClick={() => setEditingDev(true)}
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <PencilSquareIcon className="w-4 h-4" /> Chỉnh sửa
              </button>
            )}
          </div>
          {!editingDev ? (
            developer ? (
              <dl className="space-y-3">
                {renderInfoField("Họ tên", developer.fullName)}
                {renderInfoField("Email", developer.email)}
                {renderInfoField("Số điện thoại", developer.phoneNumber)}
                {renderInfoField(
                  "Số tin đăng còn lại",
                  developer.postsRemaining?.toString() || "0"
                )}
                {renderInfoField(
                  "Hạn gói dịch vụ",
                  formatDateTimeVN(developer.packageExpires)
                )}
              </dl>
            ) : (
              <p className="text-sm text-gray-500">
                Không có thông tin developer.
              </p>
            )
          ) : (
            <form onSubmit={handleDevUpdate}>
              {renderStyledInputField({
                label: "Họ tên",
                name: "fullName",
                value: devForm.fullName,
                onChange: handleDevChange,
                placeholder: "Nhập họ tên đầy đủ",
                required: true,
              })}
              {renderStyledInputField({
                label: "Số điện thoại",
                name: "phoneNumber",
                value: devForm.phoneNumber,
                onChange: handleDevChange,
                type: "tel",
                placeholder: "Nhập số điện thoại",
              })}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={cancelDevEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <CheckCircleIcon className="w-5 h-5 mr-1.5 -ml-1" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}
        </div>
        {company && <hr className="my-8 border-gray-200" />}
        {company && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5 text-purple-500" />
                Thông tin Công ty ({company.name || "Chưa có tên"})
              </h2>
              {!editingCompany && (
                <button
                  onClick={() => setEditingCompany(true)}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:gap-8">
              <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 mb-6 md:mb-0 flex flex-col items-center md:items-start">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Avatar Công ty
                </label>
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center mb-3 shadow-sm">
                  {editingCompany ? (
                    companyForm.avatarPreview ? (
                      <img
                        src={companyForm.avatarPreview}
                        alt="Xem trước Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : companyForm.currentAvatarUrl ? (
                      <img
                        src={`${companyForm.currentAvatarUrl}`}
                        alt="Avatar hiện tại"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BuildingOffice2Icon className="w-16 h-16 text-gray-400" />
                    )
                  ) : company.avatarUrl ? (
                    <img
                      src={`${company.avatarUrl}`}
                      alt="Avatar Công ty"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BuildingOffice2Icon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {editingCompany && (
                  <div>
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      Chọn ảnh mới
                    </label>
                    <input
                      id="avatar-upload"
                      name="avatar-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {companyForm.avatar && (
                      <p className="text-xs mt-1 text-gray-500">
                        Đã chọn: {companyForm.avatar.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {!editingCompany ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {renderInfoField("Tên công ty", company.name)}
                    {renderInfoField("Email", company.email)}
                    {renderInfoField("Địa chỉ", company.address)}
                    {renderInfoField(
                      "Ngôn ngữ chính",
                      company.languages?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {company.languages.map((lang, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "Không có"
                      )
                    )}
                    {renderInfoField(
                      "Quy mô công ty",
                      `${company.companySize} nhân viên`
                    )}

                    {renderInfoField("Chính sách OT", company.overtimePolicy)}
                    {renderInfoField(
                      "Ngày làm việc",
                      `${company.workingDays?.from || "?"} - ${
                        company.workingDays?.to || "?"
                      }`
                    )}
                    <div className="sm:col-span-2">
                      {renderInfoField("Mô tả", company.description)}
                    </div>
                    <div className="sm:col-span-2">
                      {renderInfoField("Tổng quan", company.overview)}
                    </div>
                  </dl>
                ) : (
                  <form onSubmit={handleCompanyUpdate}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      {renderStyledInputField({
                        label: "Email",
                        name: "email",
                        value: companyForm.email,
                        onChange: handleCompanyChange,
                        type: "email",
                      })}
                      {renderStyledInputField({
                        label: "Địa chỉ",
                        name: "address",
                        value: companyForm.address,
                        onChange: handleCompanyChange,
                      })}
                      {renderStyledInputField({
                        label: "Ngôn ngữ (cách nhau bởi dấu phẩy)",
                        name: "languages",
                        value: companyForm.languages,
                        onChange: handleCompanyChange,
                      })}
                      {renderStyledInputField({
                        label: "Quy mô công ty",
                        name: "companySize",
                        value: companyForm.companySize,
                        onChange: handleCompanyChange,
                        type: "number",
                        isNumber: true,
                      })}
                      {renderStyledInputField({
                        label: "Chính sách OT",
                        name: "overtimePolicy",
                        value: companyForm.overtimePolicy,
                        onChange: handleCompanyChange,
                      })}
                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ngày bắt đầu làm việc
                        </label>
                        <select
                          name="workingFrom"
                          value={companyForm.workingFrom}
                          onChange={handleCompanyChange}
                          className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">-- Chọn ngày bắt đầu --</option>
                          {weekdayOptions.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ngày kết thúc làm việc
                        </label>
                        <select
                          name="workingTo"
                          value={companyForm.workingTo}
                          onChange={handleCompanyChange}
                          className="block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">-- Chọn ngày kết thúc --</option>
                          {weekdayOptions.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        {renderStyledTextareaField({
                          label: "Mô tả",
                          name: "description",
                          value: companyForm.description,
                          onChange: handleCompanyChange,
                        })}
                      </div>
                      <div className="sm:col-span-2">
                        {renderStyledTextareaField({
                          label: "Tổng quan",
                          name: "overview",
                          value: companyForm.overview,
                          onChange: handleCompanyChange,
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={cancelCompanyEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-1.5 -ml-1" />
                        Lưu Công ty
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <hr className="my-6" />
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-md font-bold text-gray-700 mb-3">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          {renderStyledInputField({
            label: "Mật khẩu cũ",
            name: "oldPassword",
            value: changePasswordForm.oldPassword,
            onChange: handleChangePasswordInput,
            type: "password",
            required: true,
          })}
          {renderStyledInputField({
            label: "Mật khẩu mới",
            name: "newPassword",
            value: changePasswordForm.newPassword,
            onChange: handleChangePasswordInput,
            type: "password",
            required: true,
          })}
          {renderStyledInputField({
            label: "Xác nhận mật khẩu mới",
            name: "confirmPassword",
            value: changePasswordForm.confirmPassword,
            onChange: handleChangePasswordInput,
            type: "password",
            required: true,
          })}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="inline-flex justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CheckCircleIcon className="w-5 h-5 mr-1.5 -ml-1" />
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Me;
