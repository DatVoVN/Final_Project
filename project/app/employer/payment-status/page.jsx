import PaymentStatusClient from "@/components/PaymentStatusClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-8">Đang tải trạng thái thanh toán...</div>
      }
    >
      <PaymentStatusClient />
    </Suspense>
  );
}
