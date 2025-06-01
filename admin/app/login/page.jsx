"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const router = useRouter();

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: account,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Tài khoản hoặc mật khẩu không đúng.");
      }

      if (data.token) {
        Cookies.set("adminToken", data.token, { expires: 7, path: "/" });
        router.push("/overview");
      } else {
        setErrorMsg(
          data.message || "Đăng nhập thất bại. Không nhận được token."
        );
      }
    } catch (error) {
      setErrorMsg(error.message || "Có lỗi xảy ra trong quá trình đăng nhập.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white antialiased">
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/70 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl shadow-blue-500/10 border border-gray-700/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Admin Login
            </h1>
            <p className="text-gray-400 mt-3 text-sm">
              Quản lý hệ thống của bạn một cách dễ dàng.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm ">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="account"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Tài khoản
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors duration-150">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="account"
                  name="account"
                  type="text"
                  autoComplete="username"
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full p-3.5 pl-11 border border-gray-600/80 rounded-lg bg-gray-700/60 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-150 ease-in-out shadow-sm hover:border-gray-500"
                  placeholder="Nhập tên đăng nhập của bạn"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors duration-150">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pl-11 pr-12 border border-gray-600/80 rounded-lg bg-gray-700/60 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-150 ease-in-out shadow-sm hover:border-gray-500"
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-md transition-colors duration-150"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center p-3.5 rounded-lg text-sm font-semibold text-white
                  ${
                    isLoading
                      ? "bg-blue-700/70 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transform hover:scale-[1.02] active:scale-[0.98]"
                  }
                  transition-all duration-200 ease-out shadow-md hover:shadow-lg `}
              >
                {isLoading ? (
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
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2 -ml-1" />
                    Đăng nhập
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-center w-full">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Your Company Name. Mọi quyền được bảo
          lưu.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
