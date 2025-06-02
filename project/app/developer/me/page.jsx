"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/authContext";
import { FaSpinner } from "react-icons/fa";
import BASE_URL from "@/utils/config";
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
const getGenderDisplayName = (genderValue) => {
  switch (genderValue) {
    case "Male":
      return "Nam";
    case "Female":
      return "Nữ";
    case "Other":
      return "Khác";
    default:
      return "Chưa cập nhật";
  }
};

const ProfilePage = () => {
  const { token } = useAuth();
  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const fileInputRef = useRef(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvError, setCvError] = useState(null);
  const cvInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });
  const [isDeletingCv, setIsDeletingCv] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  useEffect(() => {
    const fetchMyInfo = async () => {
      if (!token) {
        setError("Vui lòng đăng nhập để xem thông tin.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/api/v1/candidates/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Không thể lấy thông tin người dùng."
          );
        }
        setCandidateData(data.data);
      } catch (err) {
        setError(err.message);
        setCandidateData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyInfo();
  }, [token]);

  const handleEditClick = () => {
    if (!candidateData) return;
    setFormData({
      fullName: candidateData.fullName || "",
      phone: candidateData.phone || "",
      gender: candidateData.gender || "",
      dateOfBirth: formatDateForInput(candidateData.dateOfBirth) || "",
      address: candidateData.address || "",
    });
    setIsEditing(true);
    setUpdateError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!token) {
      setUpdateError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    setIsUpdating(true);
    setUpdateError(null);
    const updateData = { ...formData };
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "") {
        if (key === "fullName") {
        } else {
          delete updateData[key];
        }
      }
    });

    try {
      const response = await fetch(`${BASE_URL}/api/v1/candidates/updateInfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          const formattedErrors = result.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join("\n");
          throw new Error(
            formattedErrors || result.message || "Cập nhật thất bại."
          );
        }
        throw new Error(result.message || "Cập nhật thất bại.");
      }

      setCandidateData(result.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      setUpdateError(err.message || "Đã có lỗi xảy ra khi cập nhật.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isUploadingAvatar && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      if (!file.type.startsWith("image/")) {
        setAvatarError("Vui lòng chọn file hình ảnh (jpg, png, gif).");
        event.target.value = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setAvatarError("Kích thước ảnh không được vượt quá 5MB.");
        event.target.value = null;
        return;
      }

      setAvatarError(null);
      if (candidateData?.avatarUrl) {
        handleAvatarUpdate(file);
      } else {
        handleAvatarUpload(file);
      }
      event.target.value = null;
    }
  };

  const handleAvatarUpdate = async (fileToUpload) => {
    if (!fileToUpload || !token) {
      setAvatarError("Không có file hoặc chưa đăng nhập.");
      return;
    }
    setIsUploadingAvatar(true);
    setAvatarError(null);

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", fileToUpload);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/candidates/me/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const responseText = await response.clone().text();
      const contentType = response.headers.get("content-type");

      if (
        !response.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        let errorMessage = `Lỗi ${response.status}.`;
        try {
          const errorResult = JSON.parse(responseText);
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {
          errorMessage = `Lỗi ${
            response.status
          }. Server response: ${responseText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setCandidateData((prevData) => ({
        ...prevData,
        avatarUrl: result.avatarUrl,
      }));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarError(err.message || "Tải ảnh lên thất bại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  const handleAvatarUpload = async (fileToUpload) => {
    if (!fileToUpload || !token || !candidateData?._id) {
      setAvatarError("Không có file hoặc thiếu ID người dùng.");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", fileToUpload);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/candidates/me/avatar/${candidateData._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Upload thất bại.");

      setCandidateData((prev) => ({
        ...prev,
        avatarUrl: result.avatarUrl,
      }));
    } catch (err) {
      console.error("❌ Upload thất bại:", err);
      setAvatarError(err.message || "Tải ảnh lên thất bại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  const handleCvChangeClick = () => {
    if (!isUploadingCv && cvInputRef.current) {
      cvInputRef.current.click();
    }
  };

  const handleCvFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      if (file.type !== "application/pdf") {
        setCvError("Vui lòng chọn file định dạng PDF.");
        event.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setCvError("Kích thước CV không được vượt quá 5MB.");
        event.target.value = null;
        return;
      }
      setCvError(null);
      handleCvUpload(file);
      event.target.value = null;
    }
  };

  const handleCvUpload = async (fileToUpload) => {
    if (!fileToUpload || !token) {
      setCvError("Không có file hoặc chưa đăng nhập.");
      return;
    }
    setIsUploadingCv(true);
    setCvError(null);

    const uploadFormData = new FormData();
    uploadFormData.append("cv", fileToUpload);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/candidates/update-cv`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });

      const responseText = await response.clone().text();
      const contentType = response.headers.get("content-type");
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        let errorMessage = `Lỗi ${response.status}.`;
        try {
          const errorResult = JSON.parse(responseText);
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setCandidateData((prevData) => ({
        ...prevData,
        cvUrl: result.cvUrl,
      }));
      alert("Cập nhật CV thành công!");
    } catch (err) {
      console.error("CV upload failed:", err);
      setCvError(err.message || "Tải CV lên thất bại.");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleDeleteCv = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa CV này không? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }
    if (!token) {
      setCvError("Lỗi xác thực. Vui lòng đăng nhập lại.");
      return;
    }
    setIsDeletingCv(true);
    setCvError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/candidates/delete-cv`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.message || `Lỗi ${response.status}: Không thể xóa CV.`
        );
      }
      setCandidateData((prevData) => {
        if (!prevData) return null;
        const { cvUrl, ...rest } = prevData;
        return rest;
      });
    } catch (error) {
      console.error("Lỗi khi xóa CV:", error);
      setCvError(error.message || "Đã xảy ra lỗi không mong muốn khi xóa CV.");
    } finally {
      setIsDeletingCv(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const { oldPassword, newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch(`${BASE_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Đổi mật khẩu thất bại.");

      setPasswordSuccess("Đổi mật khẩu thành công.");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const editLabelClass = "block text-sm font-medium text-gray-700";
  const displayLabelClass =
    "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  const commonInputClass =
    "block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm py-2.5";
  const inputWithIconClass = `${commonInputClass} px-3.5 !pl-10`;
  const selectInputClass = `${commonInputClass} px-3.5`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <FaSpinner className="animate-spin text-indigo-600 text-5xl mb-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white border border-red-200 shadow-xl rounded-xl p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-red-500 text-4xl">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Đã xảy ra lỗi
            </h2>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm transition duration-150"
            >
              <i className="bi bi-arrow-clockwise mr-2"></i>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white shadow-2xl rounded-xl p-6 sm:p-10"
          >
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              <div className="flex flex-col items-center lg:items-start gap-6 w-full lg:w-1/3">
                <div className="relative w-28 h-28 group">
                  <img
                    src={
                      candidateData?.avatarUrl
                        ? `http://localhost:8000${candidateData.avatarUrl}`
                        : "/R.jpg"
                    }
                    alt="Ảnh đại diện"
                    className="rounded-full w-full h-full object-cover border-4 border-gray-200 shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-avatar.png";
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                      isUploadingAvatar
                        ? "opacity-100 cursor-wait"
                        : "opacity-0 group-hover:opacity-100 cursor-pointer"
                    }`}
                    onClick={handleAvatarClick}
                    title={
                      isUploadingAvatar
                        ? "Đang tải lên..."
                        : "Thay đổi ảnh đại diện"
                    }
                  >
                    {isUploadingAvatar ? (
                      <svg
                        className="animate-spin h-8 w-8 text-white"
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
                      <i className="bi bi-camera text-white text-3xl"></i>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </div>
                {avatarError && (
                  <p className="text-xs text-red-600 text-center mt-1.5">
                    {avatarError}
                  </p>
                )}
                <div className="w-full text-center lg:text-left">
                  {isEditing ? (
                    <div>
                      <label htmlFor="fullName" className={editLabelClass}>
                        Họ và tên
                      </label>
                      <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <i className="bi bi-person-fill text-gray-400 text-lg"></i>
                        </span>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Nguyễn Văn A"
                          className={inputWithIconClass}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={displayLabelClass}>Họ và tên</p>
                      <h3
                        className={`text-2xl font-bold mt-0.5 ${
                          candidateData?.fullName
                            ? "text-gray-800"
                            : "text-gray-400 italic font-medium"
                        }`}
                      >
                        {candidateData?.fullName || "Chưa cập nhật"}
                      </h3>
                    </>
                  )}
                </div>
                {/* Address */}
                <div className="w-full text-center lg:text-left">
                  {isEditing ? (
                    <div>
                      <label htmlFor="address" className={editLabelClass}>
                        Địa chỉ
                      </label>
                      <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <i className="bi bi-geo-alt-fill text-gray-400 text-lg"></i>
                        </span>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/tp"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={displayLabelClass}>Địa chỉ</p>
                      <p
                        className={`text-base mt-0.5 ${
                          candidateData?.address
                            ? "text-gray-700"
                            : "text-gray-400 italic"
                        }`}
                      >
                        {candidateData?.address || "Chưa cập nhật"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <p className={displayLabelClass}>Email</p>
                  <div className="flex items-center gap-2.5 text-sm mt-0.5 text-gray-700 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <i className="bi bi-envelope-fill text-xl text-purple-600"></i>
                    <span className="flex-grow font-medium">
                      {candidateData?.email || "N/A"}
                    </span>
                    <i
                      className="bi bi-patch-check-fill text-green-500 text-xl"
                      title="Đã xác thực"
                    ></i>
                  </div>
                </div>
                <div>
                  {isEditing ? (
                    <div>
                      <label htmlFor="phone" className={editLabelClass}>
                        Số điện thoại
                      </label>
                      <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <i className="bi bi-telephone-fill text-gray-400 text-lg"></i>
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0912345678"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={displayLabelClass}>Số điện thoại</p>
                      <div className="flex items-center gap-2.5 mt-0.5">
                        <i
                          className={`bi bi-telephone-fill text-xl ${
                            candidateData?.phone
                              ? "text-purple-600"
                              : "text-gray-400"
                          }`}
                        ></i>
                        <span
                          className={`text-base ${
                            candidateData?.phone
                              ? "text-gray-700"
                              : "text-gray-400 italic"
                          }`}
                        >
                          {candidateData?.phone || "Chưa cập nhật"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div>
                      <label htmlFor="gender" className={editLabelClass}>
                        Giới tính
                      </label>
                      <div className="flex items-center gap-3 mt-1">
                        <i className="bi bi-gender-ambiguous text-xl text-gray-400"></i>
                        <select
                          name="gender"
                          id="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`${selectInputClass} flex-1`}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Male">Nam</option>
                          <option value="Female">Nữ</option>
                          <option value="Other">Khác</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={displayLabelClass}>Giới tính</p>
                      <div className="flex items-center gap-2.5 mt-0.5">
                        <i
                          className={`bi bi-gender-ambiguous text-xl ${
                            candidateData?.gender
                              ? "text-purple-600"
                              : "text-gray-400"
                          }`}
                        ></i>
                        <span
                          className={`text-base ${
                            candidateData?.gender
                              ? "text-gray-700"
                              : "text-gray-400 italic"
                          }`}
                        >
                          {getGenderDisplayName(candidateData?.gender) ||
                            "Chưa cập nhật"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {/* Date of Birth */}
                <div>
                  {isEditing ? (
                    <div>
                      <label htmlFor="dateOfBirth" className={editLabelClass}>
                        Ngày sinh
                      </label>
                      <div className="flex items-center gap-3 mt-1">
                        <i className="bi bi-calendar-heart-fill text-xl text-gray-400"></i>
                        <input
                          type="date"
                          name="dateOfBirth"
                          id="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className={`${selectInputClass} flex-1`}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={displayLabelClass}>Ngày sinh</p>
                      <div className="flex items-center gap-2.5 mt-0.5">
                        <i
                          className={`bi bi-calendar-heart-fill text-xl ${
                            candidateData?.dateOfBirth
                              ? "text-purple-600"
                              : "text-gray-400"
                          }`}
                        ></i>
                        <span
                          className={`text-base ${
                            candidateData?.dateOfBirth
                              ? "text-gray-700"
                              : "text-gray-400 italic"
                          }`}
                        >
                          {candidateData?.dateOfBirth
                            ? new Date(
                                candidateData.dateOfBirth
                              ).toLocaleDateString("vi-VN")
                            : "Chưa cập nhật"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-gray-200">
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto justify-center flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-wait transition duration-150"
                  >
                    {isUpdating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="w-full sm:w-auto justify-center flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition duration-150"
                  >
                    Hủy
                  </button>
                </div>
              )}
              {updateError && (
                <p className="text-sm text-red-600 mt-4 bg-red-50 p-3.5 rounded-md border border-red-200">
                  {updateError}
                </p>
              )}
            </div>
          </form>
          {!isEditing && (
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition duration-150"
              >
                <i className="bi bi-pencil-square"></i>
                Chỉnh sửa thông tin
              </button>
            </div>
          )}

          <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              CV của tôi
            </h2>
            <input
              type="file"
              accept=".pdf"
              ref={cvInputRef}
              onChange={handleCvFileChange}
              className="hidden"
              disabled={isUploadingCv || isDeletingCv}
            />
            {candidateData?.cvUrl ? (
              <div
                className={`p-5 border border-gray-300 rounded-lg ${
                  isUploadingCv || isDeletingCv
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden mr-2 flex-1 min-w-0">
                    <i className="bi bi-file-earmark-pdf-fill text-red-500 text-4xl flex-shrink-0"></i>{" "}
                    <a
                      href={`http://localhost:8000${
                        candidateData.cvUrl
                      }?${Date.now()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline truncate"
                      title={candidateData.cvUrl.split("/").pop()}
                    >
                      {candidateData.cvUrl.split("/").pop()}
                    </a>
                  </div>
                  <div className="flex items-center flex-shrink-0 space-x-5 mt-3 sm:mt-0">
                    <button
                      onClick={handleCvChangeClick}
                      disabled={isUploadingCv || isDeletingCv}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUploadingCv ? "Đang tải..." : "Thay đổi"}
                    </button>
                    <button
                      onClick={handleDeleteCv}
                      disabled={isUploadingCv || isDeletingCv}
                      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isDeletingCv ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed border-gray-300 p-8 rounded-lg text-center ${
                  isUploadingCv ? "opacity-60 cursor-wait" : ""
                }`}
              >
                <button
                  onClick={handleCvChangeClick}
                  disabled={isUploadingCv}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition duration-150"
                >
                  {isUploadingCv ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up-fill text-lg"></i>
                      <span>Tải lên CV</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Hỗ trợ định dạng PDF, tối đa 5MB.
                </p>
              </div>
            )}
            {cvError && (
              <p className="text-sm text-red-600 mt-4 text-center bg-red-50 p-3.5 rounded-md border border-red-200">
                {cvError}
              </p>
            )}
          </div>
          <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Đổi mật khẩu
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  required
                  className={commonInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  className={commonInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmNewPassword: e.target.value,
                    })
                  }
                  required
                  className={commonInputClass}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
                  {passwordSuccess}
                </p>
              )}
              <button
                type="submit"
                disabled={isChangingPassword}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 transition duration-150"
              >
                {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
