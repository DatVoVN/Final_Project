"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Header2 = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const hasToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    setIsLoggedIn(!!hasToken);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    setIsLoggedIn(false);
    window.location.href = "/employer";
  };

  return (
    <>
      <header className="bg-[linear-gradient(177.12deg,_#121212_48.81%,_#2563EB_98.26%)] text-white py-4 shadow-md relative z-20">
        <div className="container mx-auto max-w-screen-2xl flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
            <Image
              src="/pngtree-recruitment-geometry-frame-png-image_4398106.jpg"
              alt="Logo Tuyển Dụng IT"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="text-lg sm:text-xl font-bold tracking-wide whitespace-nowrap">
              TUYỂN DỤNG IT
            </span>
          </Link>
          <div className="hidden lg:flex items-center flex-grow justify-end gap-4 xl:gap-6">
            <div className="flex items-center space-x-3 xl:space-x-4">
              {!isLoggedIn ? (
                <Link
                  href="/auth/loginEmployers"
                  className="text-xs xl:text-sm font-medium hover:underline whitespace-nowrap px-3 py-2"
                >
                  Đăng nhập
                </Link>
              ) : (
                <>
                  <Link
                    href="/employer/news"
                    className="text-xs xl:text-sm font-medium hover:underline whitespace-nowrap px-3 py-2"
                  >
                    Trang nhà tuyển dụng
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs xl:text-sm font-medium hover:underline whitespace-nowrap px-3 py-2"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
              {/* <div className="flex items-center space-x-1 border-l border-gray-600 pl-3 xl:pl-4">
                <button className="text-xs xl:text-sm font-medium text-gray-400 hover:text-white focus:outline-none px-1">
                  EN
                </button>
                <span className="text-gray-500 text-xs">|</span>
                <button className="text-xs xl:text-sm font-bold text-white focus:outline-none px-1">
                  VI
                </button>
              </div> */}
            </div>
          </div>
          <div className="lg:hidden">
            <button
              className="text-white focus:outline-none p-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <i className="bi bi-x text-3xl"></i>
              ) : (
                <i className="bi bi-list text-3xl"></i>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-gray-800 text-white shadow-lg transition-transform duration-300 ease-in-out transform ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full -z-10"
          } ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="container mx-auto max-w-screen-2xl px-6 py-4 space-y-3">
            {!isLoggedIn ? (
              <Link
                href="/auth/loginEmployers"
                className="block py-2 text-sm font-medium hover:underline"
                onClick={closeMobileMenu}
              >
                Đăng nhập
              </Link>
            ) : (
              <>
                <Link
                  href="/employer/news"
                  className="block py-2 text-sm font-medium hover:underline"
                  onClick={closeMobileMenu}
                >
                  Trang nhà tuyển dụng
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-2 text-sm font-medium hover:underline"
                >
                  Đăng xuất
                </button>
              </>
            )}
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={closeMobileMenu}
                className="text-sm font-medium text-gray-400 hover:text-white focus:outline-none px-2 py-1"
              >
                EN
              </button>
              <span className="text-gray-500">|</span>
              <button
                onClick={closeMobileMenu}
                className="text-sm font-bold text-white focus:outline-none px-2 py-1"
              >
                VI
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header2;
