"use client";
import React, { useEffect, useState } from "react";
import Blog from "@/components/Blog/Blog";
import Pagination from "@/components/Pagination";
import { FaSpinner } from "react-icons/fa";
import BASE_URL from "@/utils/config";
const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchBlogs = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/blog?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      setBlogPosts(data.blogs || []);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Lỗi khi tải blog:", error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchBlogs(page);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="relative bg-slate-900 pt-20 pb-24 sm:pt-28 sm:pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <img
          src="/vac_default_cover_1.png"
          alt="Khám phá kiến thức công nghệ IT"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-md">
            Khám Phá Kiến Thức
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 mt-2 sm:mt-0">
              {" "}
              Công Nghệ IT
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Những bài viết sâu sắc, hướng dẫn chi tiết và cập nhật xu hướng mới
            nhất từ các chuyên gia hàng đầu trong ngành.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[40vh] py-12 text-center">
            <FaSpinner className="animate-spin text-indigo-500 text-5xl sm:text-6xl mb-6 sm:mb-8" />
            <p className="text-lg sm:text-xl font-semibold text-slate-700">
              Đang tải danh sách Blog...
            </p>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Vui lòng đợi trong giây lát.
            </p>
          </div>
        ) : blogPosts.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogPosts.map((post) => (
                <Blog
                  key={post._id}
                  size="small"
                  imageUrl={post.imageUrl}
                  title={post.title}
                  excerpt={
                    post.content?.substring(0, 100) +
                    (post.content && post.content.length > 100 ? "..." : "")
                  }
                  fullText={post.content}
                  link={`/blog/${post._id}`}
                  createdAt={post.createdAt}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-white rounded-xl shadow-lg">
            <svg
              className="mx-auto h-16 w-16 text-slate-400 mb-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-xl sm:text-2xl font-semibold text-slate-700 mb-2">
              Hiện chưa có bài viết nào
            </p>
            <p className="text-slate-500 max-w-md mx-auto">
              Chúng tôi đang cập nhật nội dung. Vui lòng quay lại sau.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
