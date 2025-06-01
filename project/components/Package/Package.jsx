import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Package = ({ pkg }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const token = Cookies.get("token");

  const handleCheckout = () => {
    if (!token) {
      alert("Bạn cần đăng nhập để mua gói.");
      return;
    }
    setShowModal(true);
  };

  const processPayment = async (method) => {
    try {
      localStorage.setItem("paidPackage", pkg.name);

      const response = await fetch(
        "http://localhost:8000/api/checkout/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packageName: pkg.name,
            method: method,
          }),
        }
      );

      const data = await response.json();

      if (data.url || data.payUrl) {
        window.location.href = data.url || data.payUrl;
      } else {
        alert(data.message || "Không thể tạo phiên thanh toán.");
      }
    } catch (err) {
      console.error("Lỗi tạo thanh toán:", err);
      alert("Đã xảy ra lỗi khi tạo phiên thanh toán.");
    }
  };

  return (
    <>
      <div className="flex flex-col p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{pkg.label}</h3>
          <p className="text-gray-600 mb-4">{pkg.description}</p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(pkg.priceVND)}₫
            </span>
            <span className="text-gray-500 ml-2">/ {pkg.duration} ngày</span>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pkg.posts} bài đăng</span>
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Hỗ trợ 24/7</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full py-3 px-6 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Mua Ngay
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-40">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 flex justify-center">
              Chọn phương thức thanh toán
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  processPayment("payos");
                }}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Thanh toán qua PayOS
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  processPayment("stripe");
                }}
                className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Thanh toán qua Stripe
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/admin/package?page=1&limit=5"
        );
        const data = await response.json();
        setPackages(data.data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Gói dịch vụ của chúng tôi
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Package key={pkg._id} pkg={pkg} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageList;
