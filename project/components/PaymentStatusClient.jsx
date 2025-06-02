"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BASE_URL from "@/utils/config";
export default function PaymentStatusClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const orderCode = searchParams.get("orderCode");

  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      if (status === "success" && sessionId) {
        const res = await fetch(`${BASE_URL}/api/payment/check-stripe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.updated) setMessage("Thanh toán Stripe thành công!");
        else setMessage("Thanh toán Stripe chưa xác nhận.");
      } else if (status === "PAID" && orderCode) {
        const res = await fetch(`${BASE_URL}/api/payment/check-payos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderCode }),
        });
        const data = await res.json();
        if (data.updated) setMessage("Thanh toán PayOS thành công!");
        else setMessage("Thanh toán PayOS chưa xác nhận.");
      } else {
        setMessage("Thanh toán thất bại hoặc bị huỷ.");
      }

      setIsLoading(false);

      const timeout = setTimeout(() => {
        router.push("/employer/news");
      }, 3000);
      return () => clearTimeout(timeout);
    };

    checkPayment();
  }, [status, sessionId, orderCode]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        {isLoading && (
          <div className="mb-4 animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        )}
        <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
        <p className="text-sm text-gray-500 mt-2">
          Bạn sẽ được chuyển về trang chính trong giây lát...
        </p>
      </div>
    </div>
  );
}
