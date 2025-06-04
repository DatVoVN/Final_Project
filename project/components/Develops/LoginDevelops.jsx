import React, { useState } from "react";
import { useAuth } from "@/context/authContext";
import BASE_URL from "@/utils/config";
import toast from "react-hot-toast";
const LoginDevelops = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleLoginSuccess } = useAuth();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState(null);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/candidate/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }

      handleLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
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
      const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }
      toast.success("Mã OTP đã được gửi đến email của bạn.");
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
      const response = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
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

      toast.success("Mật khẩu đã được thay đổi thành công.");
      setIsForgotPasswordOpen(false);
    } catch (err) {
      setResetError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm text-black">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative p-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold disabled:opacity-50"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <h2 className="text-center text-xl font-bold mb-4 text-blue-600 border border-blue-600 px-4 py-1 rounded-full inline-block">
            NGƯỜI TÌM VIỆC
          </h2>
        </div>

        <h3 className="text-center text-[22px] font-bold mb-4">ĐĂNG NHẬP</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-login" className="text-sm font-medium">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email-login"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              disabled={isLoading}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label htmlFor="password-login" className="text-sm font-medium">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="password-login"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5A00CC] hover:bg-[#4C00B8] text-white font-semibold py-2 rounded"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Bạn chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:underline font-medium"
            >
              Đăng ký
            </button>
          </p>
        </form>
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
                    <label
                      htmlFor="reset-email"
                      className="text-sm font-medium"
                    >
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
                    <label
                      htmlFor="new-password"
                      className="text-sm font-medium"
                    >
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
                    {isResetLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginDevelops;
