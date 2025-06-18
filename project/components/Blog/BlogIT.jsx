import React, { useEffect, useState } from "react";
import Blog from "./Blog";
import BASE_URL from "@/utils/config";
const BlogIT = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBlogs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/blog/top3`);
        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (error) {
        console.error("Lỗi khi tải blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBlogs();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Đang tải blog...</div>;
  }

  if (blogs.length === 0) {
    return <div className="text-center py-10">Không có blog nào.</div>;
  }

  const largeBlog = blogs[0];
  const smallBlogs = blogs.slice(1);

  return (
    <section className="py-8 sm:py-16 bg-gradient-to-b from-slate-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start h-[70%]">
          <div className="lg:col-span-2 h-full transform hover:scale-[1.02] transition-transform duration-300">
            <Blog
              size="large"
              imageUrl={largeBlog.imageUrl}
              title={largeBlog.title}
              excerpt={largeBlog.excerpt}
              fullText={largeBlog.content}
              link={`/blog/${largeBlog._id}`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8 h-full">
            {smallBlogs.map((blog) => (
              <div
                key={blog._id}
                className="transform hover:scale-105 transition-transform duration-300 h-full"
              >
                <Blog
                  imageUrl={blog.imageUrl}
                  title={blog.title}
                  excerpt={blog.excerpt}
                  link={`/blog/${blog._id}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Xem Tất Cả Bài Viết
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogIT;
