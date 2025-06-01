// File: app/forum/page.jsx
import ForumClient from "@/components/ForumClient";
import { Suspense } from "react";

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Đang tải diễn đàn...</div>}
    >
      <ForumClient />
    </Suspense>
  );
}
