"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import BASE_URL from "@/utils/config";
import Pagination from "@/components/Paginations";
import FeedModalView from "@/components/FeedModalView";
import FeedTable from "@/components/FeedTable";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchPosts = async (page = 1) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/post?page=${page}&limit=5`);
      const data = await res.json();

      if (res.ok) {
        setPosts(data.posts || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || "Lỗi khi tải danh sách bài viết");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      toast.error("Không thể tải dữ liệu bài viết");
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleView = (post) => {
    setSelectedPost(post);
    setViewModalOpen(true);
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
                  const res = await fetch(
                    `${BASE_URL}/api/v1/admin/posts/${id}`,
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  if (!res.ok) throw new Error("Xóa thất bại");

                  toast.success("Xóa bài viết thành công");
                  fetchPosts(currentPage);
                } catch (err) {
                  toast.error("Không thể xóa bài viết");
                  console.error(err);
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
        style: { background: "#1e1e1e", color: "#fff" },
      }
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">Bảng Feed</h1>

      <FeedTable posts={posts} onView={handleView} onDelete={handleDelete} />

      {posts.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <FeedModalView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        post={selectedPost}
      />
    </div>
  );
};

export default FeedPage;
