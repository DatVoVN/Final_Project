// controllers/developerController.js
const JobPosting = require("../models/JobPosting");

exports.createJobPosting = async (req, res) => {
  try {
    const { title, description, requirements, salary, city } = req.body;
    const employerId = req.userId;
    if (!title || !description || !requirements || !salary || !city) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin." });
    }

    // Tạo bài tuyển dụng mới
    const newJobPosting = new JobPosting({
      title,
      description,
      requirements,
      salary,

      city,
      employer: req.user._id,
    });
    await newJobPosting.save();

    res.status(201).json({
      message: "Bài tuyển dụng đã được đăng thành công.",
      jobPosting: newJobPosting,
    });
  } catch (error) {
    console.error("Lỗi đăng bài tuyển dụng:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
exports.getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Tìm bài đăng tuyển dụng
    const job = await JobPosting.findById(jobId).populate({
      path: "applicants.candidate",
      select: "fullName email phone cvUrl avatarUrl gender dateOfBirth address",
    });

    // Kiểm tra xem bài đăng có tồn tại không
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài đăng tuyển dụng." });
    }

    console.log("Dữ liệu ứng viên trong job.applicants:");
    console.log(job.applicants);

    // Trả về danh sách ứng viên
    res.status(200).json({ applicants: job.applicants });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ứng viên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách ứng viên." });
  }
};
exports.getEmployerJobPostings = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === "employer") {
      const jobPostings = await JobPosting.find({ employer: userId })
        .populate("employer", "fullName email")
        .populate("applicants.candidate", "fullName email");
      // Nếu không tìm thấy bài đăng
      if (jobPostings.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy bài đăng nào của bạn." });
      }
      return res.status(200).json({ jobPostings });
    }
    return res
      .status(403)
      .json({ message: "Bạn không có quyền xem các bài đăng của mình." });
  } catch (error) {
    console.error("Lỗi khi lấy bài đăng tuyển dụng của employer:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy bài đăng tuyển dụng." });
  }
};
// Xem tat ca bai ung tuyen
exports.getAllJobPostings = async (req, res) => {
  try {
    // Lấy tất cả các bài tuyển dụng
    const jobs = await JobPosting.find();

    // Kiểm tra xem có job nào không
    if (jobs.length === 0) {
      return res.status(404).json({ message: "Chưa có bài tuyển dụng nào." });
    }

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách job:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách job." });
  }
};
