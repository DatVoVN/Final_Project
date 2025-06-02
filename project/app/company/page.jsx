"use client";
import CompanyOverview from "@/components/Company/CompanyOverview";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";
import BASE_URL from "@/utils/config";
const CompanySearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [cityList, setCityList] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [submittedCity, setSubmittedCity] = useState("");
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        setCityList(res.data);
      } catch (err) {}
    };
    fetchCities();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    setQuery(trimmed);
    setSubmittedCity(selectedCity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 py-12 sm:py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight">
            Khám Phá{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Doanh Nghiệp IT
            </span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Tìm kiếm và kết nối với hàng ngàn công ty công nghệ hàng đầu. Nhập
            tên công ty hoặc chọn thành phố để bắt đầu.
          </p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-12 sm:mb-16 transform hover:scale-[1.01] transition-transform duration-300">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row sm:items-stretch gap-4"
          >
            <div className="relative flex-[3]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 h-5 w-5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-12 pr-4 border-gray-300 rounded-lg shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 text-lg placeholder-gray-400 transition-shadow"
                placeholder="Nhập tên công ty"
              />
            </div>
            <div className="relative flex-[1]">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 h-5 w-5 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-14 pl-12 pr-4 border-gray-300 rounded-lg shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 text-lg text-gray-700 bg-white transition-shadow"
              >
                <option value="">Tất cả thành phố</option>
                {cityList.map((city) => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-2 h-14
               bg-gradient-to-r from-indigo-600 to-purple-600 text-white
               font-semibold text-lg rounded-lg shadow-md
               hover:from-indigo-700 hover:to-purple-700
               transition-all duration-300 ease-in-out transform hover:scale-105
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <FaSearch className="mr-2 text-base" />
              Tìm Kiếm
            </button>
          </form>

          {(query || submittedCity) && (
            <p className="mt-4 text-sm text-gray-600">
              Đang hiển thị kết quả cho:&nbsp;
              {query && (
                <span>
                  <strong className="text-indigo-700">{query}</strong>
                  {submittedCity && " tại "}
                </span>
              )}
              {submittedCity && (
                <strong className="text-indigo-700">{submittedCity}</strong>
              )}
            </p>
          )}
        </div>
        <CompanyOverview searchQuery={query} city={submittedCity} />
      </div>
    </div>
  );
};

export default CompanySearchPage;
