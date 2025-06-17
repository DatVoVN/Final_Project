"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import BASE_URL from "@/utils/config";
import { X } from "lucide-react";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Bạn cần hỏi gì về hệ thống?" },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/chat`, { question: input });
      const botMessage = { from: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "❌ Lỗi: Không thể kết nối đến chatbot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className=" z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-colors"
        title="Chat với chúng tôi"
      >
        💬
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-auto"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-1.5 shadow"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>

            <div className="w-full bg-white shadow-xl border rounded-xl flex flex-col overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
                <span className="font-semibold">Chatbot Hỗ Trợ</span>
              </div>

              <div className="flex-1 p-3 overflow-y-auto max-h-96 space-y-2 text-sm">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md max-w-[80%] whitespace-pre-line ${
                      msg.from === "user"
                        ? "ml-auto bg-blue-100 text-right"
                        : "mr-auto bg-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {loading && (
                  <div className="text-gray-400 text-xs">Đang trả lời...</div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex border-t p-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border rounded-md text-sm"
                  placeholder="Nhập câu hỏi..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 px-3 bg-blue-600 text-white rounded-md text-sm"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
