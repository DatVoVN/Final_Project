import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const companyLinks = [
    { href: "/about-us", label: "Về Chúng Tôi" },
    { href: "/careers", label: "Tuyển Dụng" },
    { href: "/privacy-policy", label: "Chính Sách Bảo Mật" },
    { href: "/terms-of-service", label: "Điều Khoản Dịch Vụ" },
  ];

  const candidateLinks = [
    { href: "/alljob", label: "Tìm Việc Làm IT" },
    { href: "/company", label: "Danh Sách Công Ty" },
    { href: "/blog", label: "Blog Công Nghệ" },
    { href: "/candidate/dashboard", label: "Trang Cá Nhân" },
  ];

  const employerLinks = [
    { href: "/employer/post-job", label: "Đăng Tin Tuyển Dụng" },
    { href: "/employer/pricing", label: "Bảng Giá Dịch Vụ" },
    { href: "/employer/dashboard", label: "Quản Lý Tin Đăng" },
    { href: "/contact-sales", label: "Liên Hệ Tư Vấn" },
  ];

  const socialLinks = [
    {
      href: "https://facebook.com",
      icon: FaFacebookF,
      color: "hover:text-blue-500",
      label: "Facebook",
    },
    {
      href: "https://twitter.com",
      icon: FaTwitter,
      color: "hover:text-sky-400",
      label: "Twitter",
    },
    {
      href: "https://instagram.com",
      icon: FaInstagram,
      color: "hover:text-pink-500",
      label: "Instagram",
    },
    {
      href: "https://linkedin.com",
      icon: FaLinkedinIn,
      color: "hover:text-blue-700",
      label: "LinkedIn",
    },
    {
      href: "https://github.com",
      icon: FaGithub,
      color: "hover:text-gray-400",
      label: "GitHub",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-gray-900 to-black text-gray-300 pt-16 pb-8">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 lg:gap-16 mb-12">
          {/* Column 1: About & Contact */}
          <div className="space-y-6">
            <Link href="/" className="inline-block mb-2">
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                IT JOBS
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Kết nối tài năng IT với những cơ hội việc làm hàng đầu. Sứ mệnh
              của chúng tôi là xây dựng cầu nối vững chắc giữa ứng viên và nhà
              tuyển dụng.
            </p>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:contact@itjobs.com"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <FaEnvelope className="text-blue-500" /> contact@itjobs.com
              </a>
              <a
                href="tel:+84123456789"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <FaPhoneAlt className="text-blue-500" /> (+84) 123 456 789
              </a>
              <p className="flex items-start gap-2">
                {" "}
                {/* items-start cho địa chỉ dài */}
                <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
                <span>123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh</span>
              </p>
            </div>
          </div>

          {/* Column 2: For Candidates */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-5 border-l-4 border-blue-500 pl-3">
              Dành Cho Ứng Viên
            </h4>
            <ul className="space-y-3">
              {candidateLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-blue-400 hover:underline transition-colors decoration-wavy underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Employers */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-5 border-l-4 border-indigo-500 pl-3">
              Dành Cho Nhà Tuyển Dụng
            </h4>
            <ul className="space-y-3">
              {employerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-indigo-400 hover:underline transition-colors decoration-wavy underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company & Follow Us */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-5 border-l-4 border-purple-500 pl-3">
              Về IT JOBS
            </h4>
            <ul className="space-y-3 mb-8">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-purple-400 hover:underline transition-colors decoration-wavy underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-lg font-semibold text-gray-100 mb-5 border-l-4 border-pink-500 pl-3">
              Kết Nối Với Chúng Tôi
            </h4>
            <div className="flex space-x-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-125`}
                >
                  <social.icon className="text-2xl" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} IT JOBS Việt Nam. Bảo lưu mọi quyền.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Thiết kế và phát triển với <span className="text-red-500">❤</span>{" "}
            bởi đội ngũ IT JOBS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
