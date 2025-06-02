"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import JobDes from "@/components/Job/JobDes";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  FaBriefcase,
  FaExclamationCircle,
  FaInfoCircle,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaTools,
} from "react-icons/fa";
import Pagination from "@/components/Pagination";
import BASE_URL from "@/utils/config";
const LoadingIndicator = () => (
  <div className="flex flex-col justify-center items-center min-h-[1000px] py-12 text-center">
    <FaSpinner className="animate-spin text-indigo-600 text-5xl mb-6" />
    <p className="text-xl font-semibold text-slate-700">
      Đang tải dữ liệu việc làm...
    </p>
    <p className="text-md text-slate-500 mt-1">Vui lòng đợi trong giây lát.</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col justify-center items-center min-h-[1000px] bg-red-50 p-8 rounded-xl shadow-lg text-center border border-red-200">
    <FaExclamationCircle className="text-red-500 text-6xl mb-6" />
    <p className="text-2xl font-bold text-red-700 mb-3">Ối, có lỗi xảy ra!</p>
    <p className="text-slate-700 text-lg mb-6">{message}</p>
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center px-8 py-3
                 bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                 font-semibold text-base rounded-lg shadow-md
                 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg
                 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-red-50"
    >
      Thử lại
    </button>
  </div>
);

const NoResultsDisplay = ({
  message = "Rất tiếc, không tìm thấy việc làm nào phù hợp với tiêu chí của bạn.",
}) => (
  <div className="flex flex-col justify-center items-center min-h-[1000px] bg-slate-50 p-8 rounded-xl shadow-lg text-center border border-slate-200">
    <FaInfoCircle className="text-slate-400 text-6xl mb-6" />
    <p className="text-2xl font-bold text-slate-800 mb-3">
      Không tìm thấy kết quả
    </p>
    <p className="text-slate-600 text-lg mb-2">{message}</p>
    <p className="text-md text-slate-500">
      Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn.
    </p>
  </div>
);

const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(params.alljob) ? params.alljob[0] : undefined;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchForm, setSearchForm] = useState({
    title: searchParams.get("title") || "",
    companyName: searchParams.get("companyName") || "",
    city: searchParams.get("city") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    languages: searchParams.get("languages") || "",
  });
  const [cities, setCities] = useState([]);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((err) => console.error("Failed to fetch cities:", err));
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    setSearchForm({
      title: searchParams.get("title") || "",
      companyName: searchParams.get("companyName") || "",
      city: searchParams.get("city") || "",
      experienceLevel: searchParams.get("experienceLevel") || "",
      languages: searchParams.get("languages") || "",
    });
  }, [searchParams]);
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const queryParams = {};
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value && String(value).trim() !== "")
        queryParams[key] = String(value).trim();
    });

    const searchParamsStr = new URLSearchParams(queryParams).toString();
    router.replace(
      `/alljob${searchParamsStr ? `?${searchParamsStr}` : ""}`,
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentSearchParams = new URLSearchParams(
          searchParams.toString()
        );
        const page = Number(currentSearchParams.get("page")) || 1;
        currentSearchParams.set("page", page);
        currentSearchParams.set("limit", 2);

        const url = id
          ? `${BASE_URL}/api/v1/developer/jobs/company/${id}?${currentSearchParams.toString()}`
          : `${BASE_URL}/api/v1/developer/searchJob?${currentSearchParams.toString()}`;

        const res = await axios.get(url);
        setJobs(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setCurrentPage(res.data.pagination?.currentPage || 1);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách việc làm. Vui lòng thử lại."
        );
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams, id]);

  const handlePageChange = (newPage) => {
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set("page", newPage);
    router.replace(`/alljob?${queryParams.toString()}`, undefined, {
      shallow: true,
    });
  };

  const hasSearchParams = searchParams.toString().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 sm:py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight">
            Khám Phá{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Cơ Hội Việc Làm IT
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500 transform scale-x-0 transition-transform duration-500 ease-out origin-left group-hover:scale-x-100"></span>
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Tìm kiếm hàng ngàn vị trí tuyển dụng IT hấp dẫn. Nhập từ khóa, lọc
            theo kỹ năng, mức lương và địa điểm để tìm công việc mơ ước của bạn.
          </p>
        </header>
        <form
          onSubmit={handleSearch}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl mb-10 sm:mb-12 transition-all duration-300 ease-out"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-grow">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Từ khóa công việc
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 h-5 w-5 pointer-events-none z-10" />
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={searchForm.title}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-11 pr-4 border border-slate-300 rounded-lg shadow-sm
                           text-base placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-150"
                  placeholder="VD: Java Developer, ReactJS..."
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch mt-4 lg:mt-0">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-8 py-3
                           bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                           font-semibold text-base rounded-lg shadow-md
                           hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg
                           transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                           disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <FaSearch className="mr-2 text-sm" />
                {loading ? "Đang tìm..." : "Tìm kiếm"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setSearchForm({
                    title: "",
                    companyName: "",
                    city: "",
                    experienceLevel: "",
                    languages: "",
                  })
                }
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-6 py-3
             text-base font-medium text-slate-700 bg-slate-100 rounded-lg
             hover:bg-slate-200 transition-colors duration-300 ease-in-out shadow-sm
             focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                Đặt lại bộ lọc
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-6 py-3
                           text-base font-medium text-indigo-700 bg-indigo-100 rounded-lg
                           hover:bg-indigo-200 transition-colors duration-300 ease-in-out shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <FaFilter className="mr-2 text-sm" />
                {showAdvanced ? "Ẩn nâng cao" : "Nâng cao"}
                {showAdvanced ? (
                  <FaChevronUp className="ml-2 text-xs" />
                ) : (
                  <FaChevronDown className="ml-2 text-xs" />
                )}
              </button>
            </div>
          </div>
          {showAdvanced && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-5 flex items-center">
                <FaTools className="mr-3 text-indigo-500 text-lg" />
                Bộ lọc nâng cao
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-5 items-end">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Tên công ty
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    name="companyName"
                    value={searchForm.companyName}
                    onChange={handleInputChange}
                    className="w-full h-10 border-slate-300 rounded-md px-3 py-2 text-sm shadow-sm
                               focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                               transition-colors duration-150"
                    placeholder="VD: Google, Microsoft"
                  />
                </div>
                <select
                  id="city"
                  name="city"
                  value={searchForm.city}
                  onChange={handleInputChange}
                  className="w-full h-10 border-slate-300 rounded-md px-3 py-2 text-sm shadow-sm
             bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
             transition-colors duration-150"
                >
                  <option value="">-- Tất cả thành phố --</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <div>
                  <label
                    htmlFor="experienceLevel"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Cấp bậc
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={searchForm.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full h-10 border-slate-300 rounded-md pl-3 pr-8 py-2 text-sm shadow-sm
                               bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                               transition-colors duration-150 appearance-none"
                  >
                    <option value="">-- Tất cả --</option>
                    <option value="Intern">Intern</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>{" "}
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead/Trưởng nhóm</option>
                    <option value="Manager">Manager/Quản lý</option>
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>
          )}
        </form>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 border-indigo-600">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-indigo-100 p-3 rounded-full flex-shrink-0">
              <FaBriefcase className="text-indigo-600 text-2xl sm:text-3xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Kết quả tìm kiếm
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {loading ? (
                  "Đang cập nhật..."
                ) : (
                  <>
                    Tìm thấy{" "}
                    <strong className="text-indigo-700 font-semibold">
                      {jobs.filter((job) => job.isActive).length}
                    </strong>{" "}
                    việc làm
                    {hasSearchParams || id ? " phù hợp." : " mới nhất."}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-0 min-h-full">
          {loading ? (
            <LoadingIndicator />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : jobs.length === 0 ? (
            <NoResultsDisplay />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <JobDes jobs={jobs} />
              </div>
              {!loading && !error && jobs.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
