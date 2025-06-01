import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";

export default function PostCardE({ post, onDelete }) {
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedImage, setEditedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(post.imageUrl);
  const [commentPermissions, setCommentPermissions] = useState({});
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const token = Cookies.get("token");
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/post/${post._id}/can-edit`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.canEdit) {
          setCanEdit(true);
          setCanDelete(true);
        }
      } catch (err) {}
    };

    if (token) checkPermission();
  }, [post._id, token]);
  useEffect(() => {
    const checkCommentPermission = async () => {
      const permissions = {};
      for (let c of comments) {
        try {
          const res = await axios.get(
            `http://localhost:8000/api/v1/post/${post._id}/comment/${c._id}/can-edit`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          permissions[c._id] = res.data.canEdit;
        } catch (err) {
          permissions[c._id] = false;
        }
      }
      setCommentPermissions(permissions);
    };

    if (comments.length > 0) {
      checkCommentPermission();
    }
  }, [comments, post._id, token]);
  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/post/${post._id}/check-like`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHasLiked(res.data.liked); // Set the state based on the response
      } catch (err) {
        console.error(
          "Error checking like status:",
          err.response?.data || err.message
        );
      }
    };

    if (token) checkIfLiked();
  }, [post._id, token]);
  const handleToggleLike = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const url = hasLiked
        ? `http://localhost:8000/api/v1/post/${post._id}/unlike`
        : `http://localhost:8000/api/v1/post/${post._id}/like`;

      const res = await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      post.likes = res.data.likes;
      const check = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/check-like`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const liked = check.data.liked;
      setHasLiked(liked);
      if (liked) {
        toast.success("Đã thích bài viết!");
      } else {
        toast("Đã bỏ thích.", { icon: "💔" });
      }
    } catch (err) {
      toast.error("Bạn cần đăng nhập");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSaveCommentEdit = async (commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/post/${post._id}/comment/${commentId}`,
        { content: editCommentContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data.comments);
      setIsEditingComment(false);
      setEditCommentId(null);
      setEditCommentContent("");
    } catch (err) {
      toast.error(
        "Lỗi chỉnh sửa bình luận:",
        err.response?.data || err.message
      );
    }
  };
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post._id}/comment`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data.comments);
      setNewComment("");
    } catch (err) {
      console.error("Error commenting:", err.response?.data || err.message);
    }
  };
  // Cập nhật bài đăng
  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("content", editedContent);
      if (editedImage) formData.append("image", editedImage);

      const res = await axios.put(
        `http://localhost:8000/api/v1/post/${post._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      post.content = res.data.data.content;
      setCurrentImage(res.data.data.imageUrl);
      setIsEditing(false);
      setEditedImage(null);
    } catch (err) {
      console.error(
        "Lỗi cập nhật bài đăng:",
        err.response?.data || err.message
      );
    }
  };
  // Xóa bài đăng
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài viết này?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/v1/post/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error("Lỗi khi xóa bài đăng:", err.response?.data || err.message);
    }
  };
  // Kiểm tra quyền xóa bình luận
  useEffect(() => {
    const fetchPermissions = async () => {
      const permissions = {};

      for (let c of comments) {
        try {
          const res = await axios.get(
            `http://localhost:8000/api/v1/post/${post._id}/comment/${c._id}/can-delete`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          permissions[c._id] = res.data.canDelete;
        } catch (err) {
          permissions[c._id] = false;
        }
      }

      setCommentPermissions(permissions);
    };

    if (token && comments.length > 0) {
      fetchPermissions();
    }
  }, [comments, post._id, token]);

  // Xử lý xóa bình luận
  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa bình luận này?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/${post._id}/comment/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments(res.data.comments);
    } catch (err) {
      console.error(
        "Lỗi khi xóa bình luận:",
        err.response?.data || err.message
      );
    }
  };

  const authorName =
    post.author?.fullName || post.author?.companyName || "Ẩn danh";
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 transition-all hover:shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src={
              post.author?.avatarUrl
                ? `http://localhost:8000${post.author.avatarUrl}`
                : "/R.jpg"
            }
            alt="avatar"
            layout="fill"
            className="rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            {post.author?.fullName}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      {!isEditing ? (
        <p className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      ) : (
        <div className="mb-4 space-y-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Nhập nội dung bài viết..."
          />
          <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-xl cursor-pointer text-gray-500 hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditedImage(e.target.files[0])}
              className="hidden"
            />
            <span className="text-sm">
              {editedImage ? editedImage.name : "Chọn ảnh mới"}
            </span>
          </label>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu thay đổi
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(post.content);
                setEditedImage(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}
      {currentImage && (
        <div className="my-6 flex justify-center">
          <div className="relative w-full max-w-2xl h-96 rounded-xl overflow-hidden shadow-md">
            <Image
              src={`http://localhost:8000${currentImage}`}
              alt="post"
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-6 my-4 border-y py-4">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            hasLiked
              ? "bg-red-100 text-red-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={hasLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="font-medium">{post.likes?.length || 0}</span>
        </button>

        <div className="flex items-center gap-2 text-gray-600">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">{comments.length}</span>
        </div>
      </div>
      <div className="space-y-4">
        {comments.map((c, index) => (
          <div key={index} className="flex gap-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={
                  c.user?.avatarUrl
                    ? `http://localhost:8000${c.user.avatarUrl}`
                    : "/R.jpg"
                }
                alt="comment avatar"
                layout="fill"
                className="rounded-full object-cover border-2 border-white"
              />
            </div>

            <div className="flex-1 bg-gray-50 rounded-xl p-3 group hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-gray-700">
                  {c.user?.fullName || c.user?.companyName || "Ẩn danh"}
                </h4>
                {commentPermissions[c._id] && !isEditingComment && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setIsEditingComment(true);
                        setEditCommentId(c._id);
                        setEditCommentContent(c.content);
                      }}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {isEditingComment && editCommentId === c._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleSaveCommentEdit(c._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingComment(false);
                        setEditCommentId(null);
                        setEditCommentContent("");
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {c.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
        />
        <button
          onClick={handleCommentSubmit}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      {(canEdit || canDelete) && !isEditing && (
        <div className="mt-4 flex gap-3 border-t pt-4">
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Chỉnh sửa
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
