"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoginDevelops from "./Develops/LoginDevelops";
import RegisterDevelops from "./Develops/RegisterDevelops";
import {
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaCog,
  FaIdBadge,
  FaBars,
  FaTimes,
  FaBuilding,
  FaHeart,
  FaStar,
} from "react-icons/fa";
import { useAuth } from "@/context/authContext";
import BASE_URL from "@/utils/config";
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("login");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const mobileMenuPanelId = "mobile-menu-panel";

  const employerPath = "/employer";

  const navItems = [
    { href: "/alljob", label: "Việc Làm IT" },
    { href: "/company", label: "Công Ty IT" },
    { href: "/blog", label: "Blog Công Nghệ" },
    { href: "/forum", label: "Trao đổi" },
    { href: "/feed", label: "Bảng feed" },
  ];

  const userMenuItems = [
    { href: "/developer/me", label: "Hồ sơ của tôi", icon: FaIdBadge },
    {
      href: "/developer/favoriteJob",
      label: "Công việc quan tâm",
      icon: FaHeart,
    },
    {
      href: "/developer/favoriteCompany",
      label: "Công ty quan tâm",
      icon: FaStar,
    },
    {
      href: "/viewCV",
      label: "Xem CV đã tạo",
      icon: FaStar,
    },
  ];

  const handleOpenLogin = () => {
    setMode("login");
    setShowModal(true);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleOpenRegister = () => {
    setMode("register");
    setShowModal(true);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleCloseModal = () => setShowModal(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const closeUserMenu = () => setIsUserMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeUserMenu();
    closeMobileMenu();
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeUserMenu();
      }
      if (
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target) &&
        isMobileMenuOpen
      ) {
        const mobilePanel = document.getElementById(mobileMenuPanelId);
        if (mobilePanel && !mobilePanel.contains(event.target)) {
          closeMobileMenu();
        }
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  const renderUserMenuTrigger = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
        </div>
      );
    }
    if (user) {
      return (
        <button
          onClick={toggleUserMenu}
          className="flex items-center gap-2 text-sm xl:text-base font-medium text-gray-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-haspopup="true"
          aria-expanded={isUserMenuOpen}
        >
          {user.avatarUrl ? (
            <Image
              src={
                user.avatarUrl.startsWith("http")
                  ? user.avatarUrl
                  : `${user.avatarUrl}`
              }
              alt={user.fullName || "User Avatar"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border-2 border-blue-500 object-cover"
            />
          ) : (
            <FaUserCircle className="text-2xl xl:text-3xl text-blue-400" />
          )}
          <span className="hidden sm:inline block truncate max-w-[100px] overflow-hidden whitespace-nowrap">
            {user.fullName || "User"}
          </span>
          {isUserMenuOpen ? (
            <FaChevronUp className="text-xs opacity-70" />
          ) : (
            <FaChevronDown className="text-xs opacity-70" />
          )}
        </button>
      );
    }
    return (
      <button
        onClick={toggleUserMenu}
        className="flex items-center gap-1.5 text-sm xl:text-base font-medium text-gray-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        aria-haspopup="true"
        aria-expanded={isUserMenuOpen}
      >
        <FaUserCircle className="text-xl xl:text-2xl text-blue-400" />
        <span className="hidden sm:inline">Tài khoản</span>
        {isUserMenuOpen ? (
          <FaChevronUp className="text-xs opacity-70" />
        ) : (
          <FaChevronDown className="text-xs opacity-70" />
        )}
      </button>
    );
  };

  const renderUserMenuDropdown = () => {
    if (!isUserMenuOpen) return null;

    if (user) {
      return (
        <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-lg shadow-2xl py-2 z-50 ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.fullName || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email || "No email"}
            </p>
          </div>
          {userMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeUserMenu}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 group"
            >
              <item.icon className="text-indigo-500 group-hover:text-indigo-600" />
              {item.label}
            </Link>
          ))}
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
          >
            <FaSignOutAlt className="group-hover:text-red-700" /> Đăng xuất
          </button>
        </div>
      );
    }
    return (
      <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-2xl py-2 z-50 ring-1 ring-black ring-opacity-5">
        <button
          onClick={handleOpenLogin}
          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
        >
          Đăng nhập
        </button>
        <button
          onClick={handleOpenRegister}
          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
        >
          Đăng ký
        </button>
      </div>
    );
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-gray-100 py-4 shadow-xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto max-w-screen-2xl flex justify-between items-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0 group"
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300 whitespace-nowrap">
              IT JOBS
            </span>
          </Link>

          <div className="hidden lg:flex items-center flex-grow justify-end gap-5 xl:gap-8">
            <nav className="flex space-x-5 md:space-x-7">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm xl:text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="h-6 border-l border-gray-700 mx-1"></div>

            <div className="flex items-center space-x-4 xl:space-x-5">
              <span className="hidden xl:inline-block text-xs font-semibold text-indigo-300 bg-indigo-800/50 px-3 py-1.5 rounded-full shadow-sm cursor-default whitespace-nowrap">
                Dành cho Ứng Viên
              </span>
              <div className="relative" ref={userMenuRef}>
                {renderUserMenuTrigger()}
                {renderUserMenuDropdown()}
              </div>
              <Link
                href={employerPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 xl:gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 xl:px-5 xl:py-2.5 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 text-xs xl:text-sm whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <FaBuilding className="text-base xl:text-lg" />
                <span>Nhà Tuyển Dụng</span>
              </Link>
            </div>
          </div>

          <div className="lg:hidden" ref={mobileMenuButtonRef}>
            <button
              className="text-gray-200 hover:text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-blue-400"
              onClick={toggleMobileMenu}
              aria-label="Mở menu điều hướng"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuPanelId}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-3xl" />
              ) : (
                <FaBars className="text-3xl" />
              )}
            </button>
          </div>
        </div>

        <div
          id={mobileMenuPanelId}
          className={`lg:hidden absolute top-full left-0 right-0 bg-slate-800/95 backdrop-blur-sm text-gray-200 shadow-2xl transition-all duration-300 ease-in-out transform origin-top
            ${
              isMobileMenuOpen
                ? "scale-y-100 opacity-100"
                : "scale-y-95 opacity-0 pointer-events-none"
            }
          `}
        >
          <div className="container mx-auto max-w-screen-2xl px-6 py-6 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-base font-medium hover:text-white hover:bg-white/10 rounded-md px-3 transition-all duration-200 focus:outline-none focus-visible:bg-white/20"
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-gray-700 my-4" />
            {user ? (
              <>
                <div className="flex items-center gap-3 py-3 px-3">
                  {user.avatarUrl ? (
                    <Image
                      src={
                        user.avatarUrl.startsWith("http")
                          ? user.avatarUrl
                          : `http://localhost:8000${user.avatarUrl}`
                      }
                      alt={user.fullName || "User Avatar"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-blue-400" />
                  )}
                  <div>
                    <span className="font-semibold text-base block truncate max-w-[180px]">
                      {user.fullName || "User"}
                    </span>
                    <span className="text-xs text-gray-400 block truncate max-w-[180px]">
                      {user.email || "No email"}
                    </span>
                  </div>
                </div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 py-3 text-sm hover:text-white hover:bg-white/10 rounded-md px-3 transition-all duration-200 focus:outline-none focus-visible:bg-white/20"
                    onClick={closeMobileMenu}
                  >
                    <item.icon className="text-indigo-400 text-lg" />{" "}
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left py-3 text-sm hover:text-red-300 hover:bg-red-500/20 rounded-md px-3 transition-all duration-200 text-red-400 focus:outline-none focus-visible:bg-red-500/30"
                >
                  <FaSignOutAlt className="text-lg" /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <div className="py-2 px-3 text-sm font-semibold text-blue-400">
                  Dành cho Ứng Viên
                </div>
                <button
                  onClick={handleOpenLogin}
                  className="block w-full text-left py-3 text-sm font-medium hover:text-white hover:bg-white/10 rounded-md px-3 transition-all duration-200 focus:outline-none focus-visible:bg-white/20"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="block w-full text-left py-3 text-sm font-medium hover:text-white hover:bg-white/10 rounded-md px-3 transition-all duration-200 focus:outline-none focus-visible:bg-white/20"
                >
                  Đăng ký
                </button>
              </>
            )}
            <hr className="border-gray-700 my-4" />
            <Link
              href={employerPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 my-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              onClick={closeMobileMenu}
            >
              <FaBuilding className="text-lg mr-1" />
              Dành cho Nhà Tuyển Dụng
            </Link>
          </div>
        </div>
      </header>

      {mode === "login" && (
        <LoginDevelops
          isOpen={showModal}
          onClose={handleCloseModal}
          onSwitchToRegister={() => setMode("register")}
        />
      )}
      {mode === "register" && (
        <RegisterDevelops
          isOpen={showModal}
          onClose={handleCloseModal}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </>
  );
};

export default Header;
