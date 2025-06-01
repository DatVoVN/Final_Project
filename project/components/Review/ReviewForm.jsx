import { useState } from "react";
import axios from "axios";
import { StarIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const ReviewForm = ({ companyId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (star) => {
    setRating(star);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getCookie("authToken");
    if (!token) {
      toast.error("Bạn phải đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao trước khi gửi");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/candidates/${companyId}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Cảm ơn bạn đã đánh giá");
      window.location.reload();
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error.response?.data || error.message);
      alert(
        `Có lỗi xảy ra khi gửi đánh giá: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Viết đánh giá của bạn
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn:
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex flex-row-reverse">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="p-1 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <StarIcon
                      className={`w-7 h-7 transition-colors duration-150 ${
                        rating >= star
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="text-lg font-semibold text-yellow-500">
                  {rating} ★
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bình luận của bạn (bắt buộc)
            </label>
            <textarea
              id="comment"
              rows="5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="Chia sẻ trải nghiệm của bạn với công ty này..."
              required
            ></textarea>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ReviewForm;
