import React from "react";
import Link from "next/link";
import {
  FaUserEdit,
  FaFileSignature,
  FaRssSquare,
  FaArrowRight,
} from "react-icons/fa";

const ToolCard = ({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
  bgColorClass,
  textColorClass,
  iconColorClass,
}) => {
  const IconComponent = icon;

  return (
    <div
      className={`
        ${bgColorClass || "bg-white"}
        rounded-xl shadow-2xl hover:shadow-3xl
        p-6 sm:p-8 flex flex-col items-center text-center
        transition-all duration-300 ease-in-out transform hover:-translate-y-2 group h-full
      `}
    >
      <div
        className={`p-4 sm:p-5 rounded-full mb-5 sm:mb-6 inline-block shadow-lg ${
          iconColorClass || "bg-indigo-100 text-indigo-600"
        }`}
      >
        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <h3
        className={`text-xl sm:text-2xl font-bold ${
          textColorClass || "text-slate-800"
        } mb-3 sm:mb-4`}
      >
        {title}
      </h3>
      <p
        className={`text-sm sm:text-base ${
          textColorClass
            ? textColorClass.includes("white") ||
              textColorClass.includes("gray-200")
              ? "text-gray-300 opacity-90"
              : "text-gray-600"
            : "text-gray-600"
        } mb-6 sm:mb-8 leading-relaxed flex-grow`}
      >
        {description}
      </p>
      <Link href={buttonLink || "#"} legacyBehavior>
        <a
          className={`
            inline-flex items-center justify-center w-full max-w-[200px] px-6 py-3
            font-semibold rounded-lg shadow-md
            transition-all duration-300 ease-in-out transform hover:scale-105 group-hover:tracking-wider
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              bgColorClass &&
              (bgColorClass.includes("indigo") ||
                bgColorClass.includes("blue") ||
                bgColorClass.includes("purple"))
                ? "bg-white text-indigo-700 hover:bg-gray-50 focus:ring-indigo-500"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500"
            }
          `}
        >
          {buttonText}{" "}
          <FaArrowRight className="ml-2 text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </a>
      </Link>
    </div>
  );
};

const ToolSection = () => {
  const tools = [
    {
      id: 1,
      icon: FaUserEdit,
      title: "Cập Nhật Hồ Sơ",
      description:
        "Tạo một hồ sơ ấn tượng với định dạng chuẩn và hướng dẫn chi tiết để thu hút nhà tuyển dụng.",
      buttonText: "Cập Nhật CV",
      buttonLink: "/developer/me",
      bgColorClass: "bg-gradient-to-br from-sky-500 to-cyan-600",
      textColorClass: "text-white",
      iconColorClass: "bg-white/20 text-sky-100",
    },
    {
      id: 2,
      icon: FaFileSignature,
      title: "Tạo CV Chuyên Nghiệp",
      description:
        "Sử dụng các mẫu CV IT hiện đại, được các nhà tuyển dụng hàng đầu khuyên dùng, để tạo CV nổi bật.",
      buttonText: "Tạo CV Ngay",
      buttonLink: "/createCV",
      bgColorClass: "bg-gradient-to-br from-purple-500 to-indigo-600",
      textColorClass: "text-white",
      iconColorClass: "bg-white/20 text-purple-100",
    },
    {
      id: 3,
      icon: FaRssSquare,
      title: "Blog Công Nghệ IT",
      description:
        "Cập nhật những thông tin mới nhất về lương, phúc lợi, chính sách làm việc và định hướng nghề nghiệp trong ngành IT.",
      buttonText: "Đọc Blog",
      buttonLink: "/blog",
      bgColorClass: "bg-gradient-to-br from-pink-500 to-rose-600",
      textColorClass: "text-white",
      iconColorClass: "bg-white/20 text-pink-100",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          icon={tool.icon}
          title={tool.title}
          description={tool.description}
          buttonText={tool.buttonText}
          buttonLink={tool.buttonLink}
          bgColorClass={tool.bgColorClass}
          textColorClass={tool.textColorClass}
          iconColorClass={tool.iconColorClass}
        />
      ))}
    </div>
  );
};

export default ToolSection;
