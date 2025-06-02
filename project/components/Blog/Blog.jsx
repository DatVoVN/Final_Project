import React from "react";
import {
  FaRegHeart,
  FaRegComment,
  FaRegEye,
  FaEllipsisH,
} from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi2";
import BASE_URL from "@/utils/config";
const Blog = ({
  size = "small",
  imageUrl = "/placeholder-image.jpg",
  authorName = "Admin",
  publishDate = "Mar 21, 2023",
  readTime = "2 min read",
  title = "A year in color trends",
  excerpt = "Create a blog post subtitle that summarizes your post in a few short, punchy sentences and...",
  link = "/blog/blogdetail",
  onClick,
  authorImageUrl,
  createdAt,
}) => {
  const isLarge = size === "large";

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (link) {
      window.location.href = link;
    }
  };
  const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:-translate-y-1 group cursor-pointer
        flex flex-col antialiased h-full`}
    >
      {/* Phần Ảnh */}
      <div className="relative overflow-hidden aspect-w-16 aspect-h-9 sm:aspect-h-10">
        <img
          src={
            imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`
          }
          alt={title || "Blog Thumbnail"}
          className="w-full h-full object-cover
            transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            {authorImageUrl ? (
              <img
                src={authorImageUrl}
                alt={authorName}
                className="h-6 w-6 rounded-full mr-2 object-cover"
              />
            ) : (
              <HiOutlineUserCircle className="h-6 w-6 text-gray-400 mr-1.5" />
            )}
            <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
              {authorName}
            </span>
            <span className="mx-1.5">•</span>
            <span>{formattedDate}</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaEllipsisH />
          </button>
        </div>
        <h2 className="font-bold text-gray-800 mb-2 text-lg leading-snug group-hover:text-indigo-700 transition-colors duration-200 line-clamp-2">
          {title}
        </h2>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
          {excerpt}
        </p>
      </div>
    </div>
  );
};

export default Blog;
