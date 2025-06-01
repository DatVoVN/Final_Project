// utils/formatters.js
export const formatSalary = (salaryValue, currency = "VNĐ") => {
  if (!salaryValue || isNaN(salaryValue)) return "Thỏa thuận";
  return `${(salaryValue / 1000000).toLocaleString("vi-VN")} triệu ${currency}`;
};

export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "N/A";
  try {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  } catch (e) {
    return "Invalid Date";
  }
};
