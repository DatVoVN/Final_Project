"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import BASE_URL from "@/utils/config";
const LoginEmployers = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState(null);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/login/employer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
      document.cookie = `token=${data.token}; path=/; max-age=86400`;
      window.location.href = `${window.location.origin}/employer/news`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordOpen(true);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setResetError(null);
    setOtpSent(false);
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setIsResetLoading(true);
    setResetError(null);

    if (!resetEmail) {
      setResetError("Vui lòng nhập email để nhận mã OTP.");
      setIsResetLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-passwordE`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }

      alert("Mã OTP đã được gửi đến email của bạn.");
      setOtpSent(true);
    } catch (err) {
      setResetError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setIsResetLoading(true);
    setResetError(null);

    if (!otp || !newPassword) {
      setResetError("Vui lòng nhập đầy đủ mã OTP và mật khẩu mới.");
      setIsResetLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/reset-passwordE`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }

      alert("Mật khẩu đã được thay đổi thành công.");
      setIsForgotPasswordOpen(false);
    } catch (err) {
      setResetError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-12 bg-[url('/1.jpg')] bg-cover bg-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập để tiếp tục quản lý tin tuyển dụng của bạn.
          </p>
        </div>
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="alex.jordan@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-600">
          Bạn chưa có tài khoản?{" "}
          <Link
            href="/auth/registerEmployers"
            className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm text-black">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative p-6">
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-center text-[22px] font-bold mb-4">
              LẤY LẠI MẬT KHẨU
            </h3>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="text-sm font-medium">
                    Nhập email để nhận mã OTP
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  />
                </div>
                {resetError && (
                  <p className="text-sm text-red-600 text-center">
                    {resetError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#5A00CC] hover:bg-[#4C00B8] text-white font-semibold py-2 rounded"
                >
                  {isResetLoading ? "Đang xử lý..." : "Gửi mã OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="text-sm font-medium">
                    Nhập mã OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="text-sm font-medium">
                    Mật khẩu mới
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  />
                </div>
                {resetError && (
                  <p className="text-sm text-red-600 text-center">
                    {resetError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#5A00CC] hover:bg-[#4C00B8] text-white font-semibold py-2 rounded"
                >
                  {isResetLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginEmployers;
