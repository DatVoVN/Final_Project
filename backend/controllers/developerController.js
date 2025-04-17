// controllers/developerController.js
const JobPosting = require("../models/JobPosting");
const User = require("../models/User");
const Company = require("../models/Company");
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
exports.getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password").populate({
      path: "company",
      select: "-__v -createdAt -updatedAt", // loại các field không cần nếu muốn
    });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin người dùng.",
      });
    }

    res.status(200).json({
      message: "Lấy thông tin cá nhân thành công.",
      data: user,
    });
  } catch (err) {
    console.error("Error getting my info:", err);
    res.status(500).json({
      message: "Lỗi server",
      error: err.message,
    });
  }
};
// update công ty
exports.updateMyCompany = async (req, res) => {
  try {
    const companyId = req.user.company;

    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Người dùng không thuộc công ty nào." });
    }

    const allowedFields = ["name", "email", "address", "description"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }

    res.status(200).json({
      message: "Cập nhật thông tin công ty thành công.",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Lỗi cập nhật công ty:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
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
exports.getAllCompany = async (req, res) => {
  try {
    const companys = await Company.find();
    if (companys.length === 0) {
      return res.status(404).json({ message: "Chưa có công ty nào" });
    }
    res.status(200).json({ companys });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách company:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách company." });
  }
};
exports.getCompaniesByName = async (req, res) => {
  try {
    const { name } = req.query;

    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const companies = await Company.find(filter);

    res.status(200).json({
      message: "Lấy danh sách công ty thành công.",
      data: companies,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
//Lấy số job của công ty
exports.getJobsByCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;

    const jobs = await JobPosting.find({ company: companyId })
      .populate("employer", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách bài đăng của công ty thành công.",
      data: jobs,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// exports.getJobsByEmployer = async (req, res) => {
//   try {
//     const employerId = req.user.id;

//     const jobs = await JobPosting.find({ employer: employerId })
//       .populate("company", "name")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       message: "Lấy danh sách bài đăng của bạn thành công.",
//       data: jobs,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// };
