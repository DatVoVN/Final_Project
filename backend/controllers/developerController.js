const JobPosting = require("../models/JobPosting");
const User = require("../models/User");
const Company = require("../models/Company");
const Review = require("../models/Review");
//////// ĐĂNG BÀI VÀ NHẬN ỨNG VIÊN ////////////////////
exports.getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Tìm bài đăng tuyển dụng
    const job = await JobPosting.findById(jobId).populate({
      path: "applicants.candidate",
      select: "fullName email phone cvUrl avatarUrl gender dateOfBirth address",
    });

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
        .populate("applicants.candidate", "fullName email cvUrl avatarUrl");
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
///////////////////// THÔNG TIN /////////////////////////////
/// Xem thông tin của developer
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

    const allowedFields = [
      "email",
      "address",
      "description",
      "avatarUrl",
      "overview",
      "companySize",
      "overtimePolicy",
      "languages",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Nếu có workingDays trong req.body (có thể gửi dạng object hoặc JSON string)
    if (req.body.workingDays) {
      try {
        // Nếu là chuỗi JSON thì parse ra object
        const workingDays =
          typeof req.body.workingDays === "string"
            ? JSON.parse(req.body.workingDays)
            : req.body.workingDays;

        if (workingDays.from && workingDays.to) {
          updateData.workingDays = {
            from: workingDays.from,
            to: workingDays.to,
          };
        }
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Dữ liệu workingDays không hợp lệ." });
      }
    }

    // Nếu có file ảnh
    if (req.file) {
      updateData.avatarUrl = `uploads/avatars/${req.file.filename}`;
    }

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
/// filter công ty bằng tên
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
///////////////////// COMPANY /////////////////////////////////
/// Lay thong tin company theo ID
exports.getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId).lean();

    if (!company) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }
    if (company.avatarUrl) {
      company.avatarUrl = `${req.protocol}://${req.get("host")}/${
        company.avatarUrl
      }`;
    }

    res.status(200).json({
      message: "Lấy thông tin công ty thành công.",
      data: company,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin công ty:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin công ty.",
      error: error.message,
    });
  }
};
/// Lấy review cua từng công ty
exports.getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;

    const companyExists = await Company.findById(companyId).select("_id");
    if (!companyExists) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }

    const reviews = await Review.find({ company: companyId })
      .populate("candidate", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Lấy danh sách đánh giá cho công ty ${companyId} thành công.`,
      data: reviews,
    });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá công ty:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy đánh giá công ty.",
      error: error.message,
    });
  }
};
/// Lấy tất cả công ty
exports.getAllCompany = async (req, res) => {
  try {
    const companies = await Company.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "company",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageStar: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $avg: "$reviews.rating" },
              0,
            ],
          },
        },
      },
    ]);

    if (companies.length === 0) {
      return res.status(404).json({ message: "Chưa có công ty nào" });
    }

    res.status(200).json({ companies });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách company:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách company." });
  }
};
/// Lấy số job của công ty
exports.getJobsByCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const jobs = await JobPosting.find({ company: companyId })
      .populate("employer", "fullName email")
      .populate("company", "avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách bài đăng của công ty thành công.",
      data: jobs,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
/// Lấy id job của bài đăng
exports.getJobPostingByIdFix = async (req, res) => {
  try {
    const jobId = req.params.id;
    const data = await JobPosting.findById(jobId).populate("company");

    if (!data) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài tuyển dụng." });
    }
    res.status(200).json({ data });
  } catch (error) {
    console.error("Lỗi khi lấy bài tuyển dụng theo ID:", error);
    res.status(500).json({ message: "Lỗi server khi lấy bài tuyển dụng." });
  }
};
////////////////////// JOB ///////////////////////////////
/// Xem tất cả bài ứng tuyển
exports.getAllJobPostings = async (req, res) => {
  try {
    // Lấy tất cả các bài tuyển dụng
    const data = await JobPosting.find().populate({
      path: "company",
      select: "",
    });

    // Kiểm tra xem có job nào không
    if (data.length === 0) {
      return res.status(404).json({ message: "Chưa có bài tuyển dụng nào." });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách job:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách job." });
  }
};
/// search Job
exports.searchJob = async (req, res) => {
  console.log("Received Query Params for searchJob:", req.query);
  try {
    const { title, city, languages, experienceLevel, companyName } = req.query;
    const jobQuery = {};

    if (title) {
      jobQuery.title = { $regex: title, $options: "i" };
    }

    if (experienceLevel) {
      // Add validation for enum values if needed
      jobQuery.experienceLevel = experienceLevel;
    }

    if (languages) {
      const langArray = Array.isArray(languages)
        ? languages
        : languages.split(",");
      jobQuery.languages = {
        $all: langArray.map((lang) => lang.trim()).filter((lang) => lang),
      };

      jobQuery.languages = {
        $in: langArray.map((lang) => lang.trim()).filter((lang) => lang),
      };
    }

    // Handling company related filters (city, companyName)
    if (city || companyName) {
      const companyFilter = {};

      if (city) {
        companyFilter.city = { $regex: city, $options: "i" };
      }
      if (companyName) {
        companyFilter.name = { $regex: companyName, $options: "i" };
      }
      const companies = await Company.find(companyFilter).select("_id").lean();

      if (companies.length === 0) {
        return res.status(200).json({
          message: "Tìm kiếm thành công",
          data: [],
        });
      }

      const companyIds = companies.map((c) => c._id);
      jobQuery.company = { $in: companyIds };
    }

    console.log("Executing Job Query:", jobQuery);

    const jobs = await JobPosting.find(jobQuery)
      .populate({
        path: "company",
        select: "name city address avatarUrl",
      })
      .populate({
        path: "employer",
        select: "fullName email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tìm kiếm thành công",
      data: jobs,
    });
  } catch (error) {
    console.error("Lỗi server khi tìm kiếm job:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};
/// Lấy job theo id
exports.getJobPostingById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await JobPosting.findById(jobId).populate("company");

    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài tuyển dụng." });
    }
    res.status(200).json({ data: job });
  } catch (error) {
    console.error("Lỗi khi lấy bài tuyển dụng theo ID:", error);
    res.status(500).json({ message: "Lỗi server khi lấy bài tuyển dụng." });
  }
};

/////////////////////////////////////////// CRUD Co len t se lam xong //////////////////////////////////////////////////
// CRUD jobposting
exports.deleteJobPosting = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Tìm job theo ID
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }
    await JobPosting.findByIdAndDelete(jobId);

    res.status(200).json({ message: "Job posting deleted successfully." });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
// Tam an job và mo lai job
exports.deactivateJobPosting = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    job.isActive = false;
    await job.save();

    res.status(200).json({
      message: "Job posting has been deactivated.",
      job,
    });
  } catch (error) {
    console.error("Deactivate job error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.reactivateJobPosting = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    job.isActive = true;
    await job.save();

    res.status(200).json({
      message: "Job posting has been reactivated.",
      job,
    });
  } catch (error) {
    console.error("Reactivate job error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
// Edit bài đăng
exports.updateJobPosting = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?._id;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Bài tuyển dụng không tồn tại." });
    }

    // Optional: chỉ cho phép người đăng sửa
    if (job.employer.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa bài này." });
    }

    const fieldsToUpdate = [
      "title",
      "description",
      "requirements",
      "salary",
      "deadline",
      "jobType",
      "experienceLevel",
      "locationType",
      "remote",
      "languages",
      "benefits",
      "isActive",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    res.status(200).json({
      message: "Bài tuyển dụng đã được cập nhật.",
      updatedJob: job,
    });
  } catch (error) {
    console.error("Lỗi cập nhật bài tuyển dụng:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật bài tuyển dụng." });
  }
};
// Lay bài dăng theo id
exports.getJobPostingByIdByDeveloper = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await JobPosting.findById(jobId)
      .populate("company")
      .populate("employer", "fullName email");

    if (!job) {
      return res.status(404).json({ message: "Bài tuyển dụng không tồn tại." });
    }

    res.status(200).json({
      message: "Lấy thông tin bài tuyển dụng thành công.",
      jobPosting: job,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin bài tuyển dụng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
/// Thêm bài đăng
exports.createJobPosting = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      deadline,
      jobType,
      experienceLevel,
      locationType,
      remote,
      languages,
      benefits,
    } = req.body;

    const userId = req.user?._id;

    // Lấy user và populate công ty
    const user = await User.findById(userId).populate("company");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !experienceLevel
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
    }

    const newJobPosting = new JobPosting({
      title,
      description,
      requirements,
      salary,
      deadline,
      jobType: jobType || "Full-time",
      experienceLevel,
      locationType: locationType || "Onsite",
      remote: remote || false,
      languages: languages || [],
      benefits: benefits || [],
      employer: user._id,
      company: user.company?._id || null,
    });

    await newJobPosting.save();

    res.status(201).json({
      message: "Bài tuyển dụng đã được đăng thành công.",
      jobPosting: newJobPosting,
      companyInfo: user.company || null,
    });
  } catch (error) {
    console.error("Lỗi đăng bài tuyển dụng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo bài tuyển dụng." });
  }
};
