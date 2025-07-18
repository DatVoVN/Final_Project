"use client";
import React from "react";
import { CalendarDays, Heart, MessageCircle, User } from "lucide-react";
import BASE_URL from "@/utils/config";

const formatDateTime = (dateString) =>
  new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3 px-4 rounded-lg bg-slate-750 hover:bg-slate-700/60 transition-colors">
    <div className="mr-3 p-2 bg-slate-700 rounded-lg">
      <Icon className="h-5 w-5 text-cyan-400" />
    </div>
    <div className="flex-1">
      <div className="font-medium text-slate-400 text-sm">{label}</div>
      <div className="mt-1 text-white font-medium text-lg">
        {value || <span className="text-slate-400">N/A</span>}
      </div>
    </div>
  </div>
);

const CommentItem = ({ comment }) => {
  if (!comment) return null;

  return (
    <div className="flex items-start gap-3 bg-slate-750 p-3 rounded-xl border border-slate-700 hover:bg-slate-700/60 transition">
      <img
        src={
          comment.user?.avatarUrl?.startsWith("http")
            ? comment.user.avatarUrl
            : comment.user?.avatarUrl
            ? comment.user.avatarUrl
            : "/images/R.jpg"
        }
        alt={comment.user?.fullName || "Ẩn danh"}
        className="w-10 h-10 rounded-full object-cover"
      />

      <div className="flex-1">
        <div className="text-white font-semibold">
          {comment.user?.fullName || "Ẩn danh"}
        </div>
        <div className="text-slate-400 text-xs mb-1">
          {formatDateTime(comment.createdAt)}
        </div>
        <p className="text-slate-200">{comment.content}</p>
      </div>
    </div>
  );
};

const FeedModalView = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              CHI TIẾT BÀI VIẾT
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto styled-scrollbar space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow
              icon={User}
              label="Tác giả"
              value={post.author?.fullName || "Ẩn danh"}
            />
            <InfoRow
              icon={CalendarDays}
              label="Ngày đăng"
              value={formatDateTime(post.createdAt)}
            />
            <InfoRow
              icon={Heart}
              label="Lượt thích"
              value={post.likes?.length || 0}
            />
            <InfoRow
              icon={MessageCircle}
              label="Bình luận"
              value={post.comments?.length || 0}
            />
          </div>

          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-700">
              <img
                src={
                  post.imageUrl.startsWith("http")
                    ? post.imageUrl
                    : `${post.imageUrl}`
                }
                alt="Post image"
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          <div>
            <div className="text-lg font-bold text-white mb-2">Nội dung</div>
            <p className="text-slate-200 whitespace-pre-line">{post.content}</p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="text-lg font-bold text-white mb-3">
              Bình luận ({post.comments?.length || 0})
            </div>
            {post.comments?.length === 0 ? (
              <p className="text-slate-400">Chưa có bình luận nào.</p>
            ) : (
              <div className="space-y-3">
                {post.comments.map((c) => (
                  <CommentItem key={c._id} comment={c} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl text-white font-medium border border-slate-600 shadow-lg transition-all duration-300 hover:shadow-cyan-500/10"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedModalView;
