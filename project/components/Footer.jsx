import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaGithub,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    {
      href: "https://www.facebook.com/atvo.987106",
      icon: FaFacebookF,
      color: "hover:text-blue-500",
      label: "Facebook",
    },
    {
      href: "https://github.com/DatVoVN",
      icon: FaGithub,
      color: "hover:text-gray-400",
      label: "GitHub",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-gray-900 to-black text-gray-300 pt-12 pb-6">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                IT JOBS
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-md">
              Kết nối tài năng IT với những cơ hội việc làm hàng đầu. Sứ mệnh
              của chúng tôi là xây dựng cầu nối vững chắc giữa ứng viên và nhà
              tuyển dụng.
            </p>
          </div>

          {/* Bên phải: Thông tin liên hệ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-900/30 p-2 rounded-full mt-1">
                <FaEnvelope className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1">
                  Email
                </h4>
                <a className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  dat246642@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-900/30 p-2 rounded-full mt-1">
                <FaPhoneAlt className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1">
                  Điện thoại
                </h4>
                <a className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  0824480256
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="bg-blue-900/30 p-2 rounded-full mt-1">
                <FaMapMarkerAlt className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1">
                  Địa chỉ
                </h4>
                <p className="text-sm text-gray-400">
                  856/14 Tôn Đức Thắng, Thành phố Đà Nẵng
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700/50 pt-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-sm text-gray-400">Theo dõi chúng tôi:</span>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`bg-gray-800 p-2 rounded-full ${social.color} transition-all duration-300 hover:scale-110`}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} IT JOBS Việt Nam. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
