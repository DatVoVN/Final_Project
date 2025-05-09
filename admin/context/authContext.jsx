"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Kiểm tra token khi app load
  useEffect(() => {
    const token = Cookies.get("adminToken");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = (token) => {
    Cookies.set("adminToken", token, { expires: 7 });
    setIsAuthenticated(true);
    router.replace("/overview"); // replace để không quay lại login
  };

  const logout = () => {
    Cookies.remove("adminToken");
    setIsAuthenticated(false);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
