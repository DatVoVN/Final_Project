// components/UserTable.jsx
"use client";
import React from "react";
import { Check, X } from "lucide-react";
const UserTable = (props) => {
  const { users, onApprove, onReject } = props;

  if (!users || users.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        Không có dữ liệu người dùng.
      </p>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-8 border-white border">
      <table className="w-full text-sm text-left text-gray-300 border-white border">
        <thead className="text-xs text-gray-100 uppercase ">
          <tr>
            <th scope="col" className="px-6 py-3">
              Email
            </th>
            <th scope="col" className="px-6 py-3">
              Họ và Tên
            </th>
            <th scope="col" className="px-6 py-3">
              Số điện thoại
            </th>
            <th scope="col" className="px-6 py-3">
              Công ty
            </th>
            <th scope="col" className="px-6 py-3">
              Tax Code
            </th>
            {/* <th scope="col" className="px-6 py-3">
              Trạng thái
            </th> */}
            <th scope="col" className="px-6 py-3">
              Ngày tạo
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            let statusText = "Đang chờ";
            let statusColor = "text-yellow-400";
            if (user.isActive) {
              statusText = "Hoạt động";
              statusColor = "text-green-400";
            } else if (user.isRejected) {
              statusText = "Bị từ chối";
              statusColor = "text-red-400";
            }

            return (
              <tr
                key={user._id}
                className="border-b border-white hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td className="px-6 py-4 font-medium text-gray-50 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-6 py-4">{user.fullName}</td>
                <td className="px-6 py-4">{user.phoneNumber}</td>
                <td className="px-6 py-4">{user.companyName || "N/A"}</td>
                <td className="px-6 py-4">{user.taxCode}</td>
                {/* <td className={`px-6 py-4 font-semibold ${statusColor}`}>
                  {statusText}
                </td> */}
                <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => onApprove && onApprove(user._id)}
                    className="p-1.5 rounded-full text-green-400 hover:bg-green-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Chấp thuận"
                    aria-label="Chấp thuận người dùng"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => onReject && onReject(user._id)}
                    className="p-1.5 rounded-full text-red-400 hover:bg-red-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Từ chối"
                    aria-label="Từ chối người dùng"
                  >
                    <X size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
