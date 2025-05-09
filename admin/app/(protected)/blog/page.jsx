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
  const router = useRouter();

  // State to control modals
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchBlogs = async (page = 1) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/blog?page=${page}&limit=5`
      );
      setBlogs(res.data.blogs || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách blog:", error);
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Open modal to view blog
  const handleView = (blog) => {
    setSelectedBlog(blog);
    setViewModalOpen(true);
  };

  // Open modal to edit blog
  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setEditModalOpen(true);
  };

  // Delete blog
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        const token = Cookies.get("adminToken");
        await axios.delete(`http://localhost:8000/api/v1/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchBlogs(currentPage); // refresh lại trang hiện tại
      } catch (error) {
        console.error("Lỗi khi xóa blog:", error);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Danh sách blog</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
        >
          + Thêm Blog
        </button>
      </div>
      {/* Blog Table */}
      <BlogTable
        blogs={blogs}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* View Blog Modal */}
      <BlogModalView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        blog={selectedBlog}
      />

      {/* Edit Blog Modal */}
      <BlogModalEdit
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        blog={selectedBlog}
        blogId={selectedBlog?._id} // Truyền id vào modal
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
