"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import Select from "react-select";
import BASE_URL from "@/utils/config";

export default function SearchBar() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [suggestResults, setSuggestResults] = useState([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Lỗi lấy danh sách tỉnh:", error));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim()) {
        fetch(`${BASE_URL}/api/v1/developer/suggestions?query=${keyword}`)
          .then((res) => res.json())
          .then((data) => setSuggestResults(data.suggestions || []))
          .catch(() => setSuggestResults([]));
      } else {
        setSuggestResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const handleSearch = (customKeyword = keyword) => {
    const trimmedKeyword = customKeyword.trim();
    const trimmedCity = city.trim();
    const queryParams = new URLSearchParams();

    if (trimmedKeyword) queryParams.set("title", trimmedKeyword);
    if (trimmedCity) queryParams.set("city", trimmedCity);

    const queryString = queryParams.toString();
    router.push(queryString ? `/alljob?${queryString}` : "/alljob");
  };

  if (!isMounted) return null;

  const suggestions = [
    "Java",
    "ReactJS",
    ".NET",
    "Tester",
    "PHP",
    "Business Analyst",
    "NodeJS",
    "Manager",
  ];

  const cityOptions = cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  return (
    <div className="space-y-4 p-4 z-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible">
        <div className="relative flex-grow border-b sm:border-b-0 sm:border-r border-gray-200 w-full">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Tên công việc, vị trí, kỹ năng..."
            className="w-full h-16 pl-12 pr-6 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-sm font-medium"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {suggestResults.length > 0 && (
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full max-h-64 overflow-auto">
              {suggestResults.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setKeyword(item);
                    handleSearch(item);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700 text-left"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[240px] z-50 border-b sm:border-b-0 sm:border-r border-gray-200">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
          <div className="pl-11 pr-4 py-2">
            <Select
              isClearable
              options={cityOptions}
              value={cityOptions.find((opt) => opt.value === city) || null}
              onChange={(selected) => setCity(selected?.value || "")}
              placeholder="Chọn thành phố"
              className="text-sm font-medium"
              styles={{
                control: (base) => ({
                  ...base,
                  height: "44px",
                  border: "none",
                  boxShadow: "none",
                  "&:hover": { borderColor: "none" },
                }),
                option: (base) => ({
                  ...base,
                  padding: "12px 16px",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: "#3B82F6",
                },
              })}
            />
          </div>
        </div>

        <button
          onClick={() => handleSearch()}
          className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 sm:px-10 py-4 rounded-r-xl h-16 w-full sm:w-auto flex-shrink-0 hover:bg-gradient-to-r hover:from-purple-700 hover:to-violet-700 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        >
          <FaSearch className="mr-2 h-5 w-5" />
          <span className="font-semibold text-sm uppercase tracking-wide">
            Tìm kiếm
          </span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-gray-600 font-medium text-sm mr-2">Gợi ý:</span>
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => {
              setKeyword(sug);
              handleSearch(sug);
            }}
            className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-out border border-gray-200 hover:border-blue-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
}
