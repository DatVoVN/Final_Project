"use client";
import React, { useEffect, useState } from "react";
import BlogTable from "@/components/BlogTable";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Paginations";
import Cookies from "js-cookie";
import BlogModalView from "@/components/BlogModalView";
import BlogModalEdit from "@/components/BlogModalEdit";
import BlogModalAdd from "@/components/BlogModalAdd";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // const BASE_URL =
  //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const fetchBlogs = async (page = 1) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/blog?page=${page}&limit=5&search=${searchQuery}`
      );
      const data = await res.json();

      if (res.ok) {
        setBlogs(data.blogs || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Lỗi khi tải blog:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBlogs(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setViewModalOpen(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setEditModalOpen(true);
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="text-sm text-white">
          <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  const token = Cookies.get("adminToken");
                  const res = await fetch(`${BASE_URL}/api/v1/blog/${id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  if (!res.ok) throw new Error("Delete failed");

                  toast.success("Xóa bài viết thành công");
                  fetchBlogs(currentPage);
                } catch (error) {
                  toast.error("Có lỗi xảy ra khi xóa bài viết");
                  console.error("Lỗi xóa blog:", error);
                } finally {
                  toast.dismiss(t.id);
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-500"
            >
              Xóa
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: "#1e1e1e",
          color: "#fff",
        },
      }
    );
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Danh sách blog</h1>

        <div className="flex items-center gap-4 flex-grow max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg px-4 py-2 text-white flex-grow
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 whitespace-nowrap"
          >
            + Thêm Blog
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="text-gray-400 mb-2 flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Đang tìm kiếm...
        </div>
      )}

      <BlogTable
        blogs={blogs}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {blogs.length > 0 && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <BlogModalView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        blog={selectedBlog}
      />
      <BlogModalEdit
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        blog={selectedBlog}
        blogId={selectedBlog?._id}
        onUpdate={() => fetchBlogs(currentPage)}
      />
      <BlogModalAdd
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => fetchBlogs(currentPage)}
      />
    </div>
  );
};

export default BlogPage;
