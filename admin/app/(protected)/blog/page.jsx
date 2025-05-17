"use client";
import React, { useEffect, useState } from "react";
import BlogTable from "@/components/BlogTable";
import axios from "axios";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Paginations";
import Cookies from "js-cookie";
import BlogModalView from "@/components/BlogModalView";
import BlogModalEdit from "@/components/BlogModalEdit";
import BlogModalAdd from "@/components/BlogModalAdd";

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
  const fetchBlogs = async (page = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/blog?page=${page}&limit=5&search=${searchQuery}`
      );
      setBlogs(res.data.blogs || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải blog:", error);
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
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        const token = Cookies.get("adminToken");
        await axios.delete(`http://localhost:8000/api/v1/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchBlogs(currentPage);
      } catch (error) {}
    }
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
