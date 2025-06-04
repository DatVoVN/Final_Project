"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Pagination from "../Pagination";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChevronDown,
} from "react-icons/hi";
import BASE_URL from "@/utils/config";
const Receipt = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [methodFilter, setMethodFilter] = useState("all");
  const token = Cookies.get("token");

  const fetchReceipts = async (pageNumber = 1, method = "all") => {
    setLoading(true);
    try {
      const methodParam =
        method !== "all" ? `&method=${encodeURIComponent(method)}` : "";
      const res = await fetch(
        `${BASE_URL}/api/payment/my-receipts?page=${pageNumber}&limit=9${methodParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setReceipts(data.receipts || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("❌ Lỗi khi lấy hóa đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts(page, methodFilter);
  }, [page, methodFilter]);

  const methodOptions = [
    { value: "all", label: "Tất cả phương thức" },
    { value: "stripe", label: "Stripe" },
    { value: "payos", label: "PayOS" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold">Lịch sử thanh toán</h2>

        <div className="relative w-full max-w-xs">
          <select
            value={methodFilter}
            onChange={(e) => {
              setPage(1);
              setMethodFilter(e.target.value);
            }}
            className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {methodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 pointer-events-none">
            <HiOutlineChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8">Đang tải...</p>
      ) : receipts.length === 0 ? (
        <p className="text-center py-8">Không có hóa đơn phù hợp.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Gói</th>
                <th className="px-4 py-3 text-left">Phương thức</th>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Số tiền</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.map((receipt) => (
                <tr key={receipt._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {receipt.packageName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        receipt.method === "stripe"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {receipt.method === "stripe" ? (
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M2 6.5C2 5.12 3.12 4 4.5 4h15C20.88 4 22 5.12 22 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-15C3.12 20 2 18.88 2 17.5v-11zM5 7h14v2H5V7zm0 4h14v2H5v-2zm0 4h9v2H5v-2z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M2 7.75A.75.75 0 012.75 7h18.5a.75.75 0 010 1.5H2.75A.75.75 0 012 7.75zm0 4A.75.75 0 012.75 11h18.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm.75 3.25a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H2.75z" />
                        </svg>
                      )}
                      {receipt.method === "stripe" ? "Stripe" : "PayOS"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    <code className="text-xs">
                      {receipt.orderCode || receipt.sessionId}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {receipt.amount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-yellow-800"
                      }`}
                    >
                      {receipt.status === "paid" ? (
                        <HiOutlineCheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <HiOutlineClock className="w-4 h-4 mr-1" />
                      )}
                      {receipt.status === "paid"
                        ? "Đã thanh toán"
                        : "Không thành công"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(receipt.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default Receipt;
