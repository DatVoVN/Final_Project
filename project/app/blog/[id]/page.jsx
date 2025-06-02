"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter as useAppRouter } from "next/navigation";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaTags,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaUserCircle,
} from "react-icons/fa";
import Link from "next/link";
import BASE_URL from "@/utils/config";
const formatDate = (dateString) => {
  if (!dateString) return "Không rõ ngày";
  const options = { year: "numeric", month: "long", day: "numeric" };
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  } catch (e) {
    return dateString;
  }
};

const BlogDetail = () => {
  const params = useParams();
  const id = params.id;
  const router = useAppRouter();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${BASE_URL}/api/v1/blog/${id}`);
          setBlog(response.data.data);
        } catch (error) {
          console.error("Error fetching blog:", error);
          if (error.response && error.response.status === 404) {
            setError("Bài viết bạn đang tìm kiếm không tồn tại.");
          } else {
            setError(
              "Không thể tải được nội dung bài viết. Vui lòng thử lại sau."
            );
          }
          setBlog(null);
        } finally {
          setLoading(false);
        }
      };
      fetchBlog();
    } else {
      setLoading(false);
      setError("ID bài viết không hợp lệ hoặc không được cung cấp.");
      setBlog(null);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 py-20 px-4">
        <FaSpinner className="animate-spin text-indigo-500 text-6xl mb-8" />
        <p className="text-xl font-bold text-slate-700">Đang tải bài viết...</p>
        <p className="text-md text-slate-500 mt-2">
          Xin vui lòng đợi trong giây lát.
        </p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 py-20 px-4 text-center">
        <FaExclamationTriangle className="text-red-500 text-6xl mb-8" />
        <p className="text-2xl sm:text-3xl font-bold text-red-700 mb-4">
          {error ? "Đã xảy ra lỗi" : "Không tìm thấy bài viết"}
        </p>
        <p className="text-slate-700 text-lg mb-10 max-w-lg">
          {error ||
            "Rất tiếc, chúng tôi không thể tìm thấy bài viết bạn yêu cầu. ID có thể không đúng hoặc bài viết đã bị xóa."}
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white text-base font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-red-50"
        >
          <FaArrowLeft className="mr-2.5 h-5 w-5" />
          Quay Lại
        </button>
      </div>
    );
  }

  const authorName = blog.author?.name || "Admin";
  const authorAvatar = blog.author?.avatarUrl
    ? `${BASE_URL}${blog.author.avatarUrl}`
    : null;

  const heroImageUrl = blog.imageUrl
    ? `${BASE_URL}${blog.imageUrl}`
    : "/images/default-blog-hero.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-gray-50 to-white flex flex-col">
      <header className="relative bg-slate-900 pt-24 pb-28 sm:pt-32 sm:pb-36 md:pt-36 md:pb-44 overflow-hidden shrink-0">
        <img
          src="/vac_default_cover_1.png"
          alt="Khám phá kiến thức công nghệ IT"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/50 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tighter drop-shadow-lg">
            Khám Phá Kiến Thức
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 mt-2">
              Công Nghệ IT
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Những bài viết sâu sắc, hướng dẫn chi tiết và cập nhật xu hướng mới
            nhất từ các chuyên gia hàng đầu trong ngành.
          </p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 md:-mt-28 relative z-10 pb-20 md:pb-24 lg:pb-32">
        <article className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {blog.imageUrl && (
            <div className="relative w-full aspect-w-16 aspect-h-9 md:aspect-h-8 lg:aspect-h-7">
              <Image
                src={heroImageUrl}
                alt={blog.title || "Ảnh bìa bài viết"}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 ease-in-out group-hover:scale-105 rounded-t-2xl"
                priority
                onError={(e) => {
                  e.currentTarget.src = "/images/default-blog-hero.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-t-2xl"></div>
            </div>
          )}

          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="mb-6 sm:mb-8">
              <Link href="/blog" legacyBehavior>
                <a className="inline-flex items-center text-sm text-indigo-700 hover:text-indigo-900 font-bold group transition-colors duration-150">
                  <FaArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
                  Tất cả bài viết
                </a>
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 md:mb-6 leading-tight tracking-tight">
              {blog.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-5 gap-y-3 text-sm text-slate-600 mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center shrink-0">
                {authorAvatar ? (
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover mr-2.5 border-2 border-slate-200 shadow-sm"
                  />
                ) : (
                  <FaUserCircle className="w-9 h-9 text-slate-400 mr-2" />
                )}
                <span className="font-bold text-slate-800">{authorName}</span>
              </div>
              <div className="flex items-center text-slate-500">
                <FaCalendarAlt className="w-4 h-4 mr-1.5 text-indigo-500" />
                <span>
                  Đăng ngày {formatDate(blog.createdAt || blog.publishedAt)}
                </span>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-center text-slate-500">
                  <FaTags className="w-4 h-4 mr-1.5 text-purple-500" />
                  <div className="flex flex-wrap gap-1.5">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {blog.excerpt && (
              <p className="text-lg sm:text-xl text-slate-700 mb-8 p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-md italic leading-relaxed shadow-sm">
                {blog.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg sm:prose-xl lg:prose-2xl max-w-none
                         prose-slate
                         hover:prose-a:text-indigo-700
                         prose-headings:font-bold prose-headings:tracking-tight
                         prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                         prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:text-slate-700
                         prose-li:marker:text-indigo-600"
            >
              {blog.content &&
              typeof blog.content === "string" &&
              (blog.content.includes("<p>") ||
                blog.content.includes("<h1>") ||
                blog.content.includes("<ul>") ||
                blog.content.includes("<img>")) ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <p className="whitespace-pre-wrap">{blog.content}</p>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogDetail;
