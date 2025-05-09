// app/page.jsx (hoặc nơi bạn muốn kiểm tra token)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import OverViewPage from "./(protected)/overview/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("adminToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <OverViewPage />;
}
