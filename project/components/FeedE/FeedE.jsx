"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import PostCardE from "./PostCardE";
import Pagination from "../Pagination";
import BASE_URL from "@/utils/config";
import {
  FaRegImage,
  FaPaperPlane,
  FaSpinner,
  FaFeatherAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

const FeedE = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const limit = 5;
  const token = Cookies.get("token");
  const fileInputRef = useRef(null);
  const fetchPosts = useCallback(async (page = 1) => {
    setLoadingPosts(true);
    try {
      const query = new URLSearchParams({ page, limit }).toString();
      const res = await fetch(`${BASE_URL}/api/v1/post?${query}`);

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setTotalPosts(data.totalPosts || 0);
    } catch (err) {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);
  useEffect(() => {
    fetchPosts(currentPage);
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, fetchPosts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() && !image) return;
    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append("content", newPost);
      if (image) formData.append("image", image);

      const res = await fetch(`${BASE_URL}/api/v1/post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to post content");
      fetchPosts();
      const data = await res.json();
      const newPostedItem = data.post;
      if (currentPage === 1) {
        setPosts((prev) => [newPostedItem, ...prev].slice(0, limit));
        setTotalPosts((prev) => prev + 1);
      } else {
        setCurrentPage(1);
      }

      setNewPost("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Đăng bài thành công!");
    } catch (err) {
      console.error("Error posting:", err);
      toast.error("Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsPosting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-10/12 mx-auto py-8 px-7 p-5 sm:px-0 antialiased">
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xl border border-slate-200 mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          className="w-full border-slate-300 rounded-lg p-3 text-base text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-150 resize-none"
          rows="3"
        />
        {imagePreview && (
          <div className="mt-3 relative">
            <img
              src={imagePreview}
              alt="Xem trước ảnh"
              className="rounded-lg max-h-60 w-auto object-contain mx-auto shadow-md"
            />
            <button
              onClick={() => {
                setImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors text-xs"
              aria-label="Xóa ảnh"
            >
              ✕
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={triggerFileInput}
            type="button"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-150"
            aria-label="Thêm ảnh"
          >
            <FaRegImage className="h-5 w-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={handlePostSubmit}
            disabled={isPosting || (!newPost.trim() && !image)}
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isPosting ? (
              <FaSpinner className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <FaPaperPlane className="mr-2 h-4 w-4" />
            )}
            {isPosting ? "Đang Xử Lý..." : "Đăng Bài"}
          </button>
        </div>
      </div>

      {loadingPosts && currentPage === 1 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FaSpinner className="animate-spin text-indigo-500 text-4xl mb-4" />
          <p className="text-slate-600">Đang tải bài viết...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCardE
              key={post._id}
              post={post}
              onRefreshPosts={fetchPosts}
              fetchPosts={fetchPosts}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <FaFeatherAlt className="mx-auto text-5xl text-slate-400 mb-6" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Chưa có gì ở đây cả!
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Hãy là người đầu tiên chia sẻ khoảnh khắc hoặc suy nghĩ của bạn với
            cộng đồng.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default FeedE;
