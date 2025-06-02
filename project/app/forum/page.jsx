// File: app/forum/page.jsx
import ForumClient from "@/components/ForumClient";
import { Suspense } from "react";
import { FaSpinner } from "react-icons/fa";

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 py-20 px-4">
          <FaSpinner className="animate-spin text-indigo-500 text-6xl mb-8" />
          <p className="text-xl font-bold text-slate-700">
            Đang tải diễn đàn...
          </p>
          <p className="text-md text-slate-500 mt-2">
            Xin vui lòng đợi trong giây lát.
          </p>
        </div>
      }
    >
      <ForumClient />
    </Suspense>
  );
}
