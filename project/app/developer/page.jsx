"use client";
import React, { useEffect, useState } from "react";
import BlogIT from "@/components/Blog/BlogIT";
import CompanyCard from "@/components/Company/Company";
import SearchBar from "@/components/SearchBar";
import ToolSection from "@/components/Tool";
import Link from "next/link";
import { FaArrowRight, FaCogs, FaNewspaper, FaBuilding } from "react-icons/fa";
import BASE_URL from "@/utils/config";
import CvSuggestJobs from "@/components/CVSuggestJobs/CvSuggestJobs";

export default function DeveloperPageStyled() {
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCompanies = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/developer/top3`);
        const result = await res.json();
        const data = result.data;

        const formattedCompanies = data.map((item) => ({
          id: item.companyId,
          companyName: item.name,
          logoUrl: `${BASE_URL}/${item.avatarUrl}`,
          skills: item.languages || [],
          location: item.city,
          jobCount: item.jobCount,
          rating: 4.5,
          companyLink: `/company/${item.companyId}`,
        }));

        setFeaturedCompanies(formattedCompanies);
      } catch (err) {
        console.error("Failed to fetch featured companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCompanies();
  }, []);

  return (
    <>
      <section className="relative w-full min-h-[450px] md:min-h-[550px] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-100 transition-transform duration-1000 ease-out group-hover:scale-105"
          style={{ backgroundImage: "url('/1.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-slate-900/90"></div>
        <div className="relative z-10 w-full max-w-6xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-300 to-purple-300 animate-fade-in-down [animation-delay:0.2s]">
            Tìm Kiếm Cơ Hội IT Mơ Ước
          </h1>
          <p className="text-lg sm:text-xl text-indigo-200 mb-10 drop-shadow-md max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.4s]">
            Khám phá hàng ngàn việc làm và công ty IT hàng đầu tại Việt Nam.
          </p>
          <div className="bg-gradient-to-tr from-purple-50/95 via-violet-50/85 to-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-2xl shadow-2xl shadow-purple-400/10 max-w-full mx-auto animate-fade-in-up [animation-delay:0.6s] ring-1 ring-purple-200/30">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            {/* <FaCogs className="text-4xl sm:text-5xl text-indigo-600 mx-auto mb-3 sm:mb-4" /> */}
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              Công Cụ Hữu Ích
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
              Tối ưu hóa quy trình làm việc và nâng cao kỹ năng của bạn.
            </p>
          </div>
          <ToolSection />
        </div>
      </section>
      <section className="py-8 lg:py-12 bg-slate-50">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            {/* <FaBuilding className="text-4xl sm:text-5xl text-purple-600 mx-auto mb-3 sm:mb-4" /> */}
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              Doanh Nghiệp IT Hàng Đầu
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
              Những môi trường làm việc năng động và cơ hội phát triển sự
              nghiệp.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">
              Đang tải danh sách công ty...
            </div>
          ) : featuredCompanies.length === 0 ? (
            <div className="text-center text-gray-500">
              Không có công ty nổi bật nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  companyName={company.companyName}
                  logoUrl={company.logoUrl}
                  skills={company.skills}
                  location={company.location}
                  jobCount={company.jobCount}
                  companyLink={company.companyLink}
                />
              ))}
            </div>
          )}

          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/company"
              className="inline-flex items-center text-indigo-700 font-bold hover:text-indigo-900 group transition-colors text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-indigo-50"
            >
              Xem Thêm Công Ty
              <FaArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      <section className="py-6 lg:py-10 bg-white">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            {/* <FaNewspaper className="text-4xl sm:text-5xl text-pink-600 mx-auto mb-3 sm:mb-4" /> */}
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              Bài Viết & Xu Hướng IT
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
              Cập nhật kiến thức, chia sẻ kinh nghiệm và khám phá những công
              nghệ mới.
            </p>
          </div>
          <BlogIT />
          {/* <ChatbaseWidget /> */}
          <CvSuggestJobs />
        </div>
      </section>
    </>
  );
}
