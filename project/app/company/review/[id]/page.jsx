"use client";
import BlogIT from "@/components/Blog/BlogIT";
import ReviewForm from "@/components/Review/ReviewForm";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
const page = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/candidates/average-star/${id}`
        );
        setCompany(res.data.data);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    } else {
      setLoading(false);
      setError("Company ID is missing.");
    }
  }, [id]);
  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!company)
    return <div className="text-center p-10">Không tìm thầy công ty.</div>;
  return (
    <div className="h-auto w-full">
      <div className="w-full h-80 grid grid-cols-2 bg-gray-100 shadow-lg rounded-lg p-6">
        <div className="flex justify-center items-center">
          <div className="flex gap-6 items-center">
            <div>
              <img
                src="/1.jpg"
                className="w-24 h-24 object-cover rounded-full shadow-md"
              />
            </div>
            <div>
              <div className="text-xl font-semibold mb-2">{company.name}</div>
              <div className="flex gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded shadow">
                  WRITE REVIEW
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded shadow">
                  FOLLOW
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded shadow">
            Review
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded shadow">
            Job Number
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl mb-5 sticky top-0 z-10 justify-center items-center p-10 mt-2">
        <ul className="flex justify-center gap-8 px-5 ">
          <li className="list-none">
            <a
              className=" text-gray-600 font-medium border-blue-600 pb-2"
              href="/company"
            >
              Overview
            </a>
          </li>
          <li className="list-none relative">
            <a
              className="text-blue-600 hover:text-blue-600 border-b-2 transition-colors pb-2"
              href="/company/review"
            >
              Reviews
              <div className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-[0.5]">
                {company.reviews.length}
              </div>
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-8 p-10">
        <h2 className="text-xl font-semibold mb-2">Overall Rating</h2>
        <div className="flex items-center gap-2">
          <div className="text-yellow-500 text-2xl font-bold">
            {company.avgRating}★
          </div>
          <span className="text-gray-600 text-sm">
            ({company.reviews?.length} reviews)
          </span>
        </div>
      </div>
      <div className="mt-6 space-y-4 p-10">
        <h3 className="text-lg font-semibold">Employee Reviews</h3>
        {company.reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-gray-800">
                {review.candidate?.fullName}
              </span>
              <span className="text-yellow-500 font-semibold">
                {review.rating} ★
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col space-y-4 p-4">
        <div className="text-2xl font-semibold">
          Please take a minute to share your work experience at FORTNA
        </div>
        <ReviewForm companyId={id} />
      </div>

      <div className="p-2">
        <BlogIT />
      </div>
    </div>
  );
};

export default page;
