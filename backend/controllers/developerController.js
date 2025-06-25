const JobPosting = require("../models/JobPosting");
const User = require("../models/User");
const Company = require("../models/Company");
const Review = require("../models/Review");
const sendEmail = require("../utils/email");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const bucket = require("../utils/firebaseAdmin");

async function uploadAvatarToFirebase(file) {
  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext);
  const safeName = slugify(baseName, { lower: true, strict: true });
  const filename = `companies/avatar-${Date.now()}-${safeName}-${uuidv4()}${ext}`;
  const firebaseFile = bucket.file(filename);

  return new Promise((resolve, reject) => {
    const stream = firebaseFile.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    stream.on("error", reject);

    stream.on("finish", async () => {
      await firebaseFile.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      resolve({ publicUrl, filename });
    });

    stream.end(file.buffer);
  });
}
//////// ĐĂNG BÀI VÀ NHẬN ỨNG VIÊN ////////////////////
exports.getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await JobPosting.findById(jobId).populate({
      path: "applicants.candidate",
      select: "fullName email phone cvUrl avatarUrl gender dateOfBirth address",
    });

    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài đăng tuyển dụng." });
    }
    const pendingApplicants = job.applicants.filter(
      (applicant) => applicant.status === "pending"
    );
    res.status(200).json({ applicants: pendingApplicants });
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
      const jobPostings = await JobPosting.find({
        employer: userId,
        status: "approved",
      })
        .populate("employer", "fullName email")
        .populate("applicants.candidate", "fullName email cvUrl avatarUrl");
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
exports.getAllApplicantsWithJobs = async (req, res) => {
  try {
    const employerId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const jobs = await JobPosting.find({ employer: employerId })
      .populate({
        path: "applicants.candidate",
      })
      .populate({
        path: "company",
        select: "name logoUrl",
      });

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài đăng tuyển dụng của bạn." });
    }

    const applicantsWithJobs = [];
    const processedJobIds = new Set();

    for (const job of jobs) {
      if (processedJobIds.has(job._id.toString())) continue;

      applicantsWithJobs.push({
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
        },
        applicants: job.applicants.map((applicant) => ({
          candidate: applicant.candidate,
          status: applicant.status,
          appliedAt: applicant.appliedAt,
          note: applicant.note || "",
        })),
      });

      processedJobIds.add(job._id.toString());
    }

    const paginatedData = applicantsWithJobs.slice(startIndex, endIndex);

    res.status(200).json({
      total: applicantsWithJobs.length,
      page,
      totalPages: Math.ceil(applicantsWithJobs.length / limit),
      applicants: paginatedData,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ứng viên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu." });
  }
};
///////// CHẤP NHẬN VÀ TỪ CHỐI CV //////////////////
exports.handleApplicantDecision = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { action, note } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }
    const job = await JobPosting.findById(jobId).populate(
      "applicants.candidate"
    );
    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }
    const applicant = job.applicants.id(applicantId);
    if (!applicant) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy ứng viên với ID này trong bài đăng" });
    }
    applicant.status = action === "approve" ? "approved" : "rejected";
    applicant.note = note || "";

    await job.save();
    const candidate = applicant.candidate;
    const subject =
      action === "approve"
        ? `Thư mời phỏng vấn cho vị trí ${job.title}`
        : `Kết quả ứng tuyển vị trí ${job.title}`;

    const message =
      action === "approve"
        ? `Chúc mừng bạn đã vượt qua vòng sơ tuyển cho vị trí "${
            job.title
          }".\n\nThông tin thêm: ${note || "Vui lòng chờ email tiếp theo."}`
        : `Cảm ơn bạn đã quan tâm đến vị trí "${
            job.title
          }". Rất tiếc bạn chưa phù hợp.\n\nLý do: ${
            note || "Không phù hợp với yêu cầu hiện tại."
          }`;

    await sendEmail({
      email: candidate.email,
      subject,
      message,
    });

    res.status(200).json({
      message: `Ứng viên đã được ${
        action === "approve" ? "duyệt" : "loại"
      } và đã gửi email.`,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý ứng viên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.deleteApplicant = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài đăng tuyển dụng." });
    }
    const originalLength = job.applicants.length;
    job.applicants = job.applicants.filter(
      (applicant) => applicant._id.toString() !== applicantId
    );

    if (job.applicants.length === originalLength) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy ứng viên trong danh sách." });
    }

    await job.save();

    res.status(200).json({ message: "Đã xóa ứng viên khỏi bài đăng." });
  } catch (error) {
    console.error("Lỗi khi xóa ứng viên:", error);
    res.status(500).json({ message: "Lỗi server khi xóa ứng viên." });
  }
};
///////////////////// THÔNG TIN /////////////////////////////
/// Xem thông tin của developer
exports.getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password").populate({
      path: "company",
      select: "-__v -createdAt -updatedAt",
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
/// Cập nhật thông tin cá nhân của developer
exports.updateMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber } = req.body;
    if (!fullName) {
      return res.status(400).json({ message: "Họ tên là bắt buộc." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        phoneNumber,
      },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    ).populate({
      path: "company",
      select: "-__v -createdAt -updatedAt",
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng để cập nhật.",
      });
    }

    res.status(200).json({
      message: "Cập nhật thông tin thành công.",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật thông tin:", err);
    res.status(500).json({
      message: "Lỗi server khi cập nhật thông tin.",
      error: err.message,
    });
  }
};

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

    if (req.body.workingDays) {
      try {
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

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }

    if (req.file) {
      if (company.avatarPublicId) {
        try {
          await bucket.file(company.avatarPublicId).delete();
        } catch (err) {
          console.warn("⚠️ Không thể xoá avatar cũ:", err.message);
        }
      }

      const { publicUrl, filename } = await uploadAvatarToFirebase(req.file);
      updateData.avatarUrl = publicUrl;
      updateData.avatarPublicId = filename;
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    );

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
    if (company.avatarUrl && !company.avatarUrl.startsWith("http")) {
      company.avatarUrl = `${req.protocol}://${req.get(
        "host"
      )}/${company.avatarUrl.replace(/^\/?/, "")}`;
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalCompaniesAggregation = await Company.aggregate([
      {
        $lookup: {
          from: "users",
          let: { companyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$company", "$$companyId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "activeUsers",
        },
      },
      {
        $match: {
          "activeUsers.0": { $exists: true },
        },
      },
      {
        $count: "total",
      },
    ]);

    const totalCompanies = totalCompaniesAggregation[0]?.total || 0;
    const companies = await Company.aggregate([
      {
        $lookup: {
          from: "users",
          let: { companyId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$company", "$$companyId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "activeUsers",
        },
      },
      {
        $match: {
          "activeUsers.0": { $exists: true },
        },
      },
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
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    if (companies.length === 0) {
      return res
        .status(404)
        .json({ message: "Chưa có công ty nào có user đang hoạt động." });
    }

    const totalPages = Math.ceil(totalCompanies / limit);

    res.status(200).json({
      companies,
      pagination: {
        totalItems: totalCompanies,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách company:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách công ty." });
  }
};

/// Lấy số job của công ty
// exports.getJobsByCompany = async (req, res) => {
//   try {
//     const companyId = req.params.companyId;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     const totalJobs = await JobPosting.countDocuments({ company: companyId });
//     const jobs = await JobPosting.find({ company: companyId })
//       .populate("employer", "fullName email")
//       .populate("company", "avatarUrl")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({
//       message: "Lấy danh sách bài đăng của công ty thành công.",
//       data: jobs,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalJobs / limit),
//         totalJobs: totalJobs,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// };
exports.getJobsByCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { company: companyId, status: "approved" };

    const totalJobs = await JobPosting.countDocuments(filter);
    const jobs = await JobPosting.find(filter)
      .populate("employer", "fullName email")
      .populate("company", "avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Lấy danh sách bài đăng đã được duyệt của công ty thành công.",
      data: jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs: totalJobs,
      },
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { status: "approved" };
    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    const totalJobs = await JobPosting.countDocuments(filter);

    const data = await JobPosting.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({ path: "company", select: "" })
      .populate({ path: "employer", select: "" });

    if (data.length === 0) {
      return res.status(404).json({ message: "Chưa có bài tuyển dụng nào." });
    }

    res.status(200).json({
      data,
      pagination: {
        totalItems: totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách job:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách job." });
  }
};
/// search Job
exports.searchJob = async (req, res) => {
  try {
    const {
      title,
      city,
      languages,
      experienceLevel,
      companyName,
      minSalary,
      page = 1,
      limit = 10,
    } = req.query;

    const escapeRegex = (text) =>
      text.replace(/[-[\]/{}()*+?.\\^$|#]/g, "\\$&");

    const jobQuery = { status: "approved" };
    const keyword = title ? escapeRegex(title.trim()) : null;
    let companyIdsFromTitle = [];

    if (keyword) {
      const matchedCompaniesByName = await Company.find({
        name: { $regex: keyword, $options: "i" },
      })
        .select("_id")
        .lean();

      companyIdsFromTitle = matchedCompaniesByName.map((c) => c._id);

      jobQuery.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { languages: { $regex: keyword, $options: "i" } },
        ...(companyIdsFromTitle.length > 0
          ? [{ company: { $in: companyIdsFromTitle } }]
          : []),
      ];
    }

    if (experienceLevel) {
      jobQuery.experienceLevel = experienceLevel;
    }

    if (languages) {
      const langArray = Array.isArray(languages)
        ? languages
        : languages
            .split(",")
            .map((l) => l.trim().toLowerCase())
            .filter(Boolean);

      if (langArray.length) {
        if (jobQuery.$or) {
          jobQuery.$and = [{ languages: { $in: langArray } }];
        } else {
          jobQuery.languages = { $in: langArray };
        }
      }
    }

    if (minSalary) {
      jobQuery.salary = { $gte: Number(minSalary) };
    }

    if (city || companyName) {
      const companyFilter = {};
      if (city) companyFilter.city = { $regex: city, $options: "i" };
      if (companyName)
        companyFilter.name = { $regex: companyName, $options: "i" };

      const matchedCompanies = await Company.find(companyFilter)
        .select("_id")
        .lean();

      if (matchedCompanies.length === 0) {
        return res.status(200).json({
          message: "Không tìm thấy công ty nào khớp với tiêu chí tìm kiếm.",
          data: [],
          pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: Number(page),
            pageSize: Number(limit),
          },
        });
      }

      const companyIds = matchedCompanies.map((c) => c._id);
      if (jobQuery.company) {
        jobQuery.company.$in = [
          ...new Set([...jobQuery.company.$in, ...companyIds]),
        ];
      } else {
        jobQuery.company = { $in: companyIds };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalJobs = await JobPosting.countDocuments(jobQuery);

    const jobs = await JobPosting.find(jobQuery)
      .populate({ path: "company", select: "name city address avatarUrl" })
      .populate({ path: "employer", select: "fullName email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      message: "Tìm kiếm thành công",
      data: jobs,
      pagination: {
        totalItems: totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm job:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};
// suggest job
exports.getJobSuggestions = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Thiếu từ khóa." });
    }

    const regex = new RegExp(query, "i");

    const jobs = await JobPosting.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      {
        $match: {
          $or: [
            { title: { $regex: regex } },
            { "company.name": { $regex: regex } },
          ],
        },
      },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          title: 1,
          companyName: "$company.name",
        },
      },
    ]);

    const suggestions = jobs
      .flatMap((job) => [job.title, job.companyName])
      .filter(Boolean);

    const unique = [...new Set(suggestions)];

    res.status(200).json({ suggestions: unique });
  } catch (error) {
    console.error("Lỗi khi lấy gợi ý:", error);
    res.status(500).json({ message: "Lỗi server khi lấy gợi ý." });
  }
};
// search company
exports.searchCompany = async (req, res) => {
  try {
    const { name, city } = req.query;

    if (!name && !city) {
      return res
        .status(400)
        .json({ message: "Thiếu tên công ty hoặc thành phố để tìm kiếm." });
    }

    const matchConditions = {};

    if (name) {
      matchConditions.name = { $regex: name, $options: "i" };
    }

    if (city) {
      matchConditions.city = { $regex: city, $options: "i" };
    }

    const companies = await Company.aggregate([
      {
        $match: matchConditions,
      },
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy công ty nào phù hợp." });
    }

    res.status(200).json({ companies });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm công ty:", error);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm công ty." });
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
      "vacancies",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    if (
      job.vacancies !== undefined &&
      (isNaN(job.vacancies) || job.vacancies <= 0)
    ) {
      return res
        .status(400)
        .json({ message: "Số lượng tuyển phải là số lớn hơn 0." });
    }

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
      vacancies,
    } = req.body;

    const userId = req.user?._id;
    const user = await User.findById(userId).populate("company");

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    if (user.postsRemaining <= 0) {
      return res.status(403).json({
        message: "Bạn đã hết lượt đăng bài. Vui lòng mua thêm gói để tiếp tục.",
      });
    }
    if (!user.packageExpires || new Date() > user.packageExpires) {
      return res.status(403).json({
        message: "Gói của bạn đã hết hạn. Vui lòng mua thêm gói để tiếp tục.",
      });
    }

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !experienceLevel ||
      !vacancies
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc." });
    }

    if (isNaN(vacancies) || Number(vacancies) <= 0) {
      return res
        .status(400)
        .json({ message: "Số lượng tuyển phải là số lớn hơn 0." });
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
      vacancies: Number(vacancies),
      employer: user._id,
      company: user.company?._id || null,
      status: "pending",
    });

    await newJobPosting.save();
    user.postsRemaining -= 1;
    await user.save();

    res.status(201).json({
      message: "Bài tuyển dụng đã được tạo và đang chờ admin duyệt.",
      jobPosting: newJobPosting,
      companyInfo: user.company || null,
    });
  } catch (error) {
    console.error("Lỗi đăng bài tuyển dụng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo bài tuyển dụng." });
  }
};
// Lấy top 3 công ty
exports.getTop3CompaniesWithJobDetails = async (req, res) => {
  try {
    const result = await JobPosting.aggregate([
      {
        $match: {
          company: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$company",
          jobCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      {
        $unwind: "$companyInfo",
      },
      {
        $project: {
          _id: 0,
          companyId: "$companyInfo._id",
          name: "$companyInfo.name",
          avatarUrl: "$companyInfo.avatarUrl",
          industry: "$companyInfo.industry",
          city: "$companyInfo.city",
          languages: "$companyInfo.languages",
          jobCount: 1,
        },
      },
      {
        $sort: { jobCount: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    res.status(200).json({
      message: "Top 3 công ty có nhiều job nhất.",
      data: result,
    });
  } catch (err) {
    console.error("Lỗi khi lấy top công ty:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
exports.getTop5CompaniesWithJobDetails = async (req, res) => {
  try {
    const result = await JobPosting.aggregate([
      {
        $match: {
          company: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$company",
          jobCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      {
        $unwind: "$companyInfo",
      },
      {
        $project: {
          _id: 0,
          companyId: "$companyInfo._id",
          name: "$companyInfo.name",
          avatarUrl: "$companyInfo.avatarUrl",
          industry: "$companyInfo.industry",
          city: "$companyInfo.city",
          languages: "$companyInfo.languages",
          jobCount: 1,
        },
      },
      {
        $sort: { jobCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      message: "Top 5 công ty có nhiều job nhất.",
      data: result,
    });
  } catch (err) {
    console.error("Lỗi khi lấy top công ty:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
