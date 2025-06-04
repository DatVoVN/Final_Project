"use client";
import StatCard from "@/components/StatCard";
import {
  Building2,
  SquareActivity,
  TrendingUp,
  User,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import BASE_URL from "@/utils/config";
const OverViewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topCompanies, setTopCompanies] = useState([]);

  // const BASE_URL =
  //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchTopCompanies = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/developer/top5`);
        const data = await response.json();
        setTopCompanies(data.data || []);
      } catch (error) {
        console.error("Error fetching top companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCompanies();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/admin/stat`);
        const json = await res.json();
        setStats(json.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [BASE_URL]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">Đang tải thống kê...</div>
    );
  }

  if (!stats) {
    return <div className="text-center ">Không thể tải thống kê.</div>;
  }

  const chartData = stats.jobsPerDay
    ?.map((item) => ({
      ...item,
      _id: dayjs(item._id).format("YYYY-MM-DD"),
    }))
    .sort((a, b) => new Date(a._id) - new Date(b._id));

  return (
    <div className="flex-1 overflow-x-auto relative z-10">
      <main className="max-w-7xl mx-auto py-4 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Công ty" icon={Building2} value={stats.companies} />
          <StatCard name="Nhà tuyển dụng" icon={User} value={stats.employers} />
          <StatCard name="Ứng viên" icon={UserPlus} value={stats.candidates} />
          <StatCard name="Job" icon={SquareActivity} value={stats.jobs} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl border border-[#1f1f1f] p-6"
          >
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Top công ty nhiều việc làm
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-[#2d2d2d]">
                    <th className="pb-3 px-4 text-left font-medium">Công ty</th>
                    <th className="pb-3 px-4 text-right font-medium">Số job</th>
                  </tr>
                </thead>
                <tbody>
                  {topCompanies.map((company) => (
                    <tr
                      key={company.companyId}
                      className="border-b border-[#2d2d2d] last:border-0 hover:bg-[#252525] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              company.avatarUrl
                                ? `${BASE_URL}/${company.avatarUrl}`
                                : "/images/company.png"
                            }
                            alt={company.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-gray-300 truncate">
                            {company.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white font-medium bg-blue-600/20 px-3 py-1 rounded-full text-sm">
                          {company.jobCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loading && (
                <div className="text-gray-400 text-center py-6 animate-pulse">
                  Đang tải dữ liệu...
                </div>
              )}

              {!loading && !topCompanies.length && (
                <div className="text-gray-400 text-center py-6">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </motion.div>

          <div className="md:w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl border border-[#1f1f1f] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-300">
                  Xu hướng đăng job 7 ngày
                </h3>
                {!loading && (
                  <div className="flex items-center space-x-2 text-sm text-blue-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      Tổng:{" "}
                      {stats.jobsPerDay?.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}{" "}
                      job
                    </span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">
                  Đang tải dữ liệu...
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                      <XAxis
                        dataKey="_id"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af" }}
                        tickFormatter={(value) => dayjs(value).format("DD/MM")}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#1e1e1e",
                          border: "1px solid #2d2d2d",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => [value, "Số job"]}
                        labelFormatter={(label) =>
                          `Ngày: ${dayjs(label).format("DD/MM/YYYY")}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#1e3a8a", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {!loading && stats.jobsPerDay?.length === 0 && (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Không có dữ liệu
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OverViewPage;
