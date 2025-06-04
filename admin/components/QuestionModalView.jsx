"use client";
import React from "react";
import { MessageCircle, User, CalendarDays, MessageSquare } from "lucide-react";
import BASE_URL from "@/utils/config";

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

const AnswerCard = ({ answer }) => (
  <div className="flex items-start gap-4 bg-slate-750 p-4 rounded-xl border border-slate-700 hover:bg-slate-700/60 transition">
    <img
      src={
        answer.candidate.avatarUrl?.startsWith("http")
          ? answer.candidate.avatarUrl
          : `${BASE_URL}${answer.candidate.avatarUrl}`
      }
      alt={answer.candidate.fullName}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="flex-1">
      <div className="text-white font-semibold">
        {answer.candidate.fullName}
      </div>
      <div className="text-slate-400 text-xs mb-1">
        {new Date(answer.createdAt).toLocaleString("vi-VN")}
      </div>
      <p className="text-slate-200">{answer.content}</p>
    </div>
  </div>
);

const QuestionModalView = ({ isOpen, onClose, question }) => {
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700">
        <div className="relative p-5 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-xl"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              CHI TIẾT CÂU HỎI
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
              label="Ứng viên"
              value={question.candidate.fullName}
            />
            <InfoRow
              icon={CalendarDays}
              label="Ngày tạo"
              value={new Date(question.createdAt).toLocaleString("vi-VN")}
            />
            <div className="md:col-span-2">
              <InfoRow
                icon={MessageCircle}
                label="Nội dung câu hỏi"
                value={question.content}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center mb-3">
              <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 mr-3"></div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Câu trả lời ({question.answers.length})
              </h3>
            </div>

            {question.answers.length === 0 ? (
              <p className="text-slate-400">Chưa có câu trả lời nào.</p>
            ) : (
              <div className="space-y-3">
                {question.answers.map((answer) => (
                  <AnswerCard key={answer._id} answer={answer} />
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
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModalView;
