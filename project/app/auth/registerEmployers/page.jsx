"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const RegistrationSuccessMessage = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out">
      <div className="bg-white px-6 pt-8 pb-10 rounded-xl shadow-2xl w-full max-w-md mx-auto text-center transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-pop-in">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
          Đăng ký thành công!
        </h3>
        <p className="text-gray-600 text-sm px-4 mb-8">
          {message ||
            "Yêu cầu của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi sớm nhất."}
        </p>
        <Link href={"/employer"} legacyBehavior>
          <a className="inline-block px-8 py-3 bg-indigo-600 text-white font-medium text-base rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
            Về trang quản lý
          </a>
        </Link>
      </div>

      {/* CSS cho animation - Bạn cần thêm đoạn này vào file CSS global hoặc dùng <style jsx global> */}
      <style jsx global>{`
        @keyframes modal-pop-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-pop-in {
          animation: modal-pop-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// --- COMPONENT FORM ĐĂNG KÝ (Đã style lại) ---
const EmployerRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    companyName: "",
    taxCode: "",
    city: "",
  });
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      // ... (logic fetch giữ nguyên)
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }
        const data = await response.json();
        data.sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp A-Z
        setCities(data);
      } catch (fetchError) {
        console.error("Error fetching cities:", fetchError);
        // Có thể set error state ở đây nếu cần
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    // ... (logic submit giữ nguyên)
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/register/employer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMsg =
          result.error ||
          result.message ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      setSuccessMessage(
        result.message ||
          "Đăng ký tài khoản thành công. Vui lòng chờ quản trị viên phê duyệt."
      );
      setIsSuccess(true);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err.message ||
          "Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (isSuccess) {
    return <RegistrationSuccessMessage message={successMessage} />;
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-12 bg-[url('/1.jpg')] bg-cover bg-center">
      <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-lg shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Đăng ký tài khoản Nhà tuyển dụng
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@congty.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Tên công ty theo GPKD"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="taxCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mã số thuế <span className="text-red-500">*</span>
              </label>
              <input
                id="taxCode"
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                placeholder="Mã số thuế công ty"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Thành phố/Tỉnh <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
              >
                <option value="" disabled>
                  -- Chọn thành phố/tỉnh --
                </option>
                {cities.map((city) => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>{" "}
          {error && (
            <div
              className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md relative text-sm"
              role="alert"
            >
              <strong className="font-medium">Có lỗi xảy ra:</strong>
              <span className="block sm:inline ml-1"> {error}</span>
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
            </button>
          </div>
        </form>{" "}
        <div className="text-sm text-center text-gray-600 pt-4">
          {" "}
          Bạn đã có tài khoản?{" "}
          <Link
            href="/auth/loginEmployers"
            className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>{" "}
    </div>
  );
};

export default EmployerRegistrationForm;
