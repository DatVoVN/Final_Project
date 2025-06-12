import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import BASE_URL from "@/utils/config";
import toast from "react-hot-toast";
const RegisterDevelops = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState(null);

  if (!isOpen) return null;
  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResendOtpMessage(null);
    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/auth/candidate/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }
      setSuccessMessage(data.message);
      setRegisteredEmail(email);
      setShowOtpInput(true);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOtpSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResendOtpMessage(null);

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP gồm 6 chữ số.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/auth/candidate/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: registeredEmail, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }
      setSuccessMessage(data.message);
      toast.success("Đăng ký thành công");
      setTimeout(() => {
        onClose();
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message || "Xác thực OTP thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    setResendOtpMessage(null);
    setIsResendingOtp(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/auth/candidate/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registeredEmail }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}`);
      }
      setResendOtpMessage(data.message);
    } catch (err) {
      setError(err.message || "Gửi lại OTP thất bại.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm text-black">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative p-6">
        <button
          onClick={() => {
            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setOtp("");
            setShowOtpInput(false);
            setRegisteredEmail("");
            setIsLoading(false);
            setError(null);
            setSuccessMessage(null);
            setIsResendingOtp(false);
            setResendOtpMessage(null);

            onClose();
          }}
          disabled={isLoading || isResendingOtp}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold disabled:opacity-50"
        >
          ×
        </button>

        {!showOtpInput ? (
          <>
            <div className="flex justify-center mb-4">
              <h2 className="text-center text-xl font-bold mb-4 text-blue-600 border border-blue-600 px-4 py-1 rounded-full inline-block">
                NGƯỜI TÌM VIỆC
              </h2>
            </div>
            <h3 className="text-center text-[22px] font-bold mb-4">ĐĂNG KÍ</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName-reg" className="text-sm font-medium">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName-reg"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email-reg" className="text-sm font-medium">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email-reg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password-reg" className="text-sm font-medium">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  id="password-reg"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword-reg"
                  className="text-sm font-medium"
                >
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword-reg"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5A00CC] hover:bg-[#4C00B8] text-white font-semibold py-2 rounded disabled:opacity-70 disabled:cursor-wait flex items-center justify-center"
              >
                {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                  className="text-blue-600 hover:underline font-medium disabled:opacity-50"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          </>
        ) : (
          // --- GIAO DIỆN NHẬP OTP ---
          <>
            <div className="flex justify-center mb-4">
              <h2 className="text-center text-xl font-bold mb-4 text-blue-600 border border-blue-600 px-4 py-1 rounded-full inline-block">
                XÁC THỰC OTP
              </h2>
            </div>
            <h3 className="text-center text-[22px] font-bold mb-2">
              Nhập Mã OTP
            </h3>
            <p className="text-center text-sm text-gray-600 mb-4">
              Một mã OTP gồm 6 chữ số đã được gửi đến{" "}
              <span className="font-medium">{registeredEmail}</span>. Vui lòng
              nhập mã vào ô bên dưới.
            </p>
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp-input" className="text-sm font-medium">
                  Mã OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp-input"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  placeholder="Nhập 6 chữ số"
                  required
                  maxLength={6}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center text-lg"
                  autoComplete="one-time-code"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              {successMessage && (
                <p className="text-sm text-green-600 text-center">
                  {successMessage}
                </p>
              )}
              {resendOtpMessage && (
                <p className="text-sm text-blue-600 text-center">
                  {resendOtpMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded disabled:opacity-70 disabled:cursor-wait flex items-center justify-center"
              >
                {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Không nhận được mã?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp || isLoading}
                  className="text-blue-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-wait"
                >
                  {isResendingOtp ? "Đang gửi lại..." : "Gửi lại mã"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterDevelops;
