// components/HeroSectionEmployerNew.js
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineSearchCircle,
} from "react-icons/hi";

const HeroSectionEmployerNew = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[url('/1.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50 z-0"></div>{" "}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full filter blur-3xl opacity-50 animate-pulse z-0"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-sky-400/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-400 z-0"></div>
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-snug drop-shadow-lg">
              Tuyển dụng{" "}
              <span className="font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Nhân tài IT
              </span>
              <br className="hidden sm:block" />
              Nhanh chóng & Hiệu quả
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto lg:mx-0 drop-shadow">
              Nền tảng chuyên biệt kết nối doanh nghiệp với hàng ngàn lập trình
              viên, kỹ sư IT chất lượng cao tại Việt Nam. Tối ưu quy trình, tiết
              kiệm thời gian.
            </p>
            <div className="mt-10 space-y-5">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <HiOutlineUserGroup className="w-6 h-6 text-sky-400 flex-shrink-0" />{" "}
                <span className="text-gray-100 font-medium drop-shadow">
                  Tiếp cận 50,000+ hồ sơ IT chất lượng, cập nhật liên tục.
                </span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <HiOutlineSearchCircle className="w-6 h-6 text-sky-400 flex-shrink-0" />
                <span className="text-gray-100 font-medium drop-shadow">
                  Công cụ tìm kiếm & sàng lọc ứng viên thông minh, chính xác.
                </span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <HiOutlineCheckCircle className="w-6 h-6 text-sky-400 flex-shrink-0" />
                <span className="text-gray-100 font-medium drop-shadow">
                  Đăng tin dễ dàng, quản lý ứng viên hiệu quả trên một nền tảng.
                </span>
              </div>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/auth/loginEmployers"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Đăng tin ngay
              </Link>
              <p className="mt-3 sm:mt-0 text-sm text-gray-200 drop-shadow">
                Đã có tài khoản?{" "}
                <Link
                  href="/auth/loginEmployers"
                  className="font-medium text-sky-400 hover:text-sky-300 underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 mt-12 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <Image
                src="/1.jpg"
                alt="Giao diện nền tảng tuyển dụng IT hiện đại"
                width={500}
                height={450}
                className="rounded-xl object-cover shadow-2xl transform transition duration-500 hover:scale-105"
                priority
              />
              <div className="absolute -bottom-6 -right-6 z-20 hidden sm:block">
                <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-100">
                  <p className="text-xs text-indigo-600 font-semibold">
                    +150 New Profiles Today
                  </p>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 z-20 hidden sm:block">
                <div className="p-3 bg-white rounded-full shadow-lg border border-gray-100 animate-pulse">
                  <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </section>
  );
};

export default HeroSectionEmployerNew;
