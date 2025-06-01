"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;Secure;SameSite=Strict`;
};

// Helper function to get a cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const deleteCookie = (name) => {
  setCookie(name, "", -1);
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/candidates/me",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Token không hợp lệ hoặc hết hạn");
      }
      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      console.error("Lỗi fetch user:", error);
      setToken(null);
      setUser(null);
      deleteCookie("authToken");
    }
  };

  useEffect(() => {
    const storedToken = getCookie("authToken");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Hàm xử lý sau khi đăng nhập thành công
  const handleLoginSuccess = (loginData) => {
    const newToken = loginData.token;
    setToken(newToken);
    setUser(loginData.candidate);
    setCookie("authToken", newToken, 7);
  };

  // Hàm đăng xuất
  const logout = () => {
    setToken(null);
    setUser(null);
    deleteCookie("authToken");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, handleLoginSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng AuthContext dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
