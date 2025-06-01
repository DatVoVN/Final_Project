const Candidate = require("../models/Candidate");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const JobPosting = require("../models/JobPosting");
const Company = require("../models/Company");
const Review = require("../models/Review");
const deleteFileIfExists = require("../helper/deleteFileIfExists");
////////////////  ỨNG TUYỂN JOB ///////////////////
/// Ứng tuyển
const applyToJob = async (req, res) => {
  try {
    const candidateId = req.userId;
    const { jobId } = req.body;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài đăng tuyển dụng." });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const alreadyApplied = job.applicants.some(
      (app) => app.candidate.toString() === candidateId
    );
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "Bạn đã ứng tuyển bài đăng này rồi." });
    }

    candidate.appliedJobs.push(jobId);
    await candidate.save();
    job.applicants.push({ candidate: candidateId });
    await job.save();

    res.status(200).json({ message: "Ứng tuyển thành công." });
  } catch (error) {
    console.error("Lỗi khi ứng tuyển:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
/// Hủy ứng tuyển
const unapplyFromJob = async (req, res) => {
  try {
    const candidateId = req.userId;
    const { jobId } = req.body;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài đăng tuyển dụng." });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    // Filter all occurrences of jobId from appliedJobs
    candidate.appliedJobs = candidate.appliedJobs.filter(
      (id) => id.toString() !== jobId.toString()
    );
    await candidate.save();

    // Xóa ứng viên khỏi job.applicants
    await JobPosting.updateOne(
      { _id: jobId },
      { $pull: { applicants: { candidate: candidateId } } }
    );

    res.status(200).json({ message: "Huỷ ứng tuyển thành công." });
  } catch (error) {
    console.error("Lỗi khi huỷ ứng tuyển:", error);
    res.status(500).json({ message: "Lỗi server khi huỷ ứng tuyển." });
  }
};
/// Check xem đang ở trạng thái ứng tuyển hay chưa ứng tuyển
const checkAppliedStatus = async (req, res) => {
  try {
    const candidateId = req.userId;
    const { jobId } = req.params;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ hasApplied: false });

    const hasApplied = candidate.appliedJobs.some(
      (id) => id.toString() === jobId
    );

    return res.status(200).json({ hasApplied });
  } catch (err) {
    console.error("Lỗi check trạng thái ứng tuyển:", err);
    return res.status(500).json({ hasApplied: false });
  }
};
// Đánh giá công ty
const createOrUpdateReview = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { rating, comment } = req.body;
    const candidateId = req.user.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }
    const review = await Review.findOneAndUpdate(
      { company: companyId, candidate: candidateId },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Đánh giá công ty thành công.",
      data: review,
    });
  } catch (err) {
    console.error("Lỗi khi đánh giá công ty:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// Cập nhật lại đánh giá của công ty
const updateReview = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { rating, comment } = req.body;
    const candidateId = req.user.id;

    // Kiểm tra company tồn tại
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }

    // Tìm review của ứng viên với công ty này
    const review = await Review.findOne({
      company: companyId,
      candidate: candidateId,
    });

    if (!review) {
      return res
        .status(404)
        .json({ message: "Bạn chưa đánh giá công ty này." });
    }

    // Cập nhật đánh giá
    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    res.status(200).json({
      message: "Cập nhật đánh giá thành công.",
      data: review,
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật đánh giá:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// Lấy sao trung bình của công ty
const getCompanyWithReviews = async (req, res) => {
  try {
    const companyId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "ID công ty không hợp lệ." });
    }

    const reviews = await Review.find({ company: companyId })
      .populate("candidate", "fullName")
      .populate("company", "name");

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;

    res.status(200).json({
      message: "Lấy đánh giá thành công.",
      data: {
        reviews,
        avgRating: avgRating.toFixed(1),
        totalReviews: reviews.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
///////////////////// CV ///////////////////////////
// Controller xử lý upload CV
const uploadCV = async (req, res) => {
  try {
    const candidateId = req.params.id || req.user.id;
    if (!candidateId) {
      return res.status(400).json({ message: "Thiếu thông tin ứng viên." });
    }
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file PDF." });
    }
    if (candidate.cvUrl) {
      const oldPath = path.join(__dirname, "..", candidate.cvUrl);
      if (
        fs.existsSync(oldPath) &&
        candidate.cvUrl.startsWith("/uploads/cv/")
      ) {
        try {
          fs.unlinkSync(oldPath);
          console.log(`Deleted old CV: ${oldPath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting old CV ${oldPath}:`, unlinkErr);
        }
      }
    }
    candidate.cvUrl = `/uploads/cv/${req.file.filename}`;
    await candidate.save();
    res.status(200).json({
      message: "Tải CV thành công!",
      cvUrl: candidate.cvUrl,
    });
  } catch (err) {
    console.error("Error uploading CV:", err);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`Deleted uploaded file due to error: ${req.file.path}`);
      } catch (cleanupErr) {
        console.error(
          `Error cleaning up uploaded file ${req.file.path}:`,
          cleanupErr
        );
      }
    }
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// Controller cập nhật CV
const updateCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file PDF mới." });
    }
    if (candidate.cvUrl) {
      const oldPath = path.join(__dirname, "..", candidate.cvUrl);
      if (
        fs.existsSync(oldPath) &&
        candidate.cvUrl.startsWith("/uploads/cv/")
      ) {
        try {
          fs.unlinkSync(oldPath);
          console.log(`Deleted old CV for update: ${oldPath}`);
        } catch (unlinkErr) {
          console.error(
            `Error deleting old CV ${oldPath} during update:`,
            unlinkErr
          );
        }
      }
    }
    candidate.cvUrl = `/uploads/cv/${req.file.filename}`;
    await candidate.save();
    res.status(200).json({
      message: "Cập nhật CV thành công!",
      cvUrl: candidate.cvUrl,
    });
  } catch (err) {
    console.error("Error updating CV:", err);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(
          `Deleted newly uploaded file due to error: ${req.file.path}`
        );
      } catch (cleanupErr) {
        console.error(
          `Error cleaning up newly uploaded file ${req.file.path}:`,
          cleanupErr
        );
      }
    }
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
/// Controller xóa CV
const deleteCV = async (req, res) => {
  try {
    console.log("User from request:", req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }
    const userId = req.user.id;
    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ ứng viên." });
    }
    if (!candidate.cvUrl) {
      return res.status(400).json({ message: "Không có CV nào để xóa." });
    }
    const currentCvPath = candidate.cvUrl;
    console.log("Current CV Path from DB:", currentCvPath);

    candidate.cvUrl = undefined;
    await candidate.save();
    console.log("Candidate saved successfully (cvUrl removed).");
    let deleted = false;
    try {
      deleted = await deleteFileIfExists(currentCvPath);
    } catch (fileError) {
      deleted = false;
    }

    if (deleted) {
      res.status(200).json({ message: "Xóa CV thành công!" });
    } else {
      console.warn(
        `Physical file deletion failed or file not found for path: ${currentCvPath}`
      );
      res.status(200).json({
        message:
          "Đã xóa thông tin CV khỏi hồ sơ, nhưng file vật lý không tồn tại hoặc có lỗi khi xóa.",
        warning: `File not found or deletion error for path: ${currentCvPath}`,
      });
    }
  } catch (err) {
    console.error("Error in deleteCV handler:", err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
      return res
        .status(400)
        .json({ message: "Lỗi validation khi xóa CV.", errors: errors });
    }
    res
      .status(500)
      .json({ message: "Lỗi server khi xóa CV.", error: err.message });
  }
};
////////////////////// INFO //////////////////////
/// Controller lấy thông tin ứng viên theo ID
const getCandidateInfoByID = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id).select("-password");
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }
    res.status(200).json({
      message: "Lấy thông tin ứng viên thành công.",
      data: candidate,
    });
  } catch (err) {
    console.error("Error getting candidate by ID:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
/// Controller lấy thông tin cá nhân của ứng viên đang đăng nhập
const getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findById(userId).select("-password");
    if (!candidate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }
    res.status(200).json({
      message: "Lấy thông tin cá nhân thành công.",
      data: candidate,
    });
  } catch (err) {
    console.error("Error getting my info:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
/// Controller cập nhật thông tin cá nhân
const updateMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findById(userId);

    if (!candidate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    // Lấy các trường được phép cập nhật từ req.body dựa trên Schema
    const {
      fullName,
      phone,
      gender,
      dateOfBirth,
      address,
      // Thêm các trường tùy chỉnh khác nếu có trong schema và muốn cho phép cập nhật
    } = req.body;

    // Danh sách các trường được phép cập nhật
    const allowedUpdates = {};
    if (fullName !== undefined) allowedUpdates.fullName = fullName;
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (gender !== undefined) allowedUpdates.gender = gender;
    if (dateOfBirth !== undefined) {
      const dob = new Date(dateOfBirth);
      if (!isNaN(dob.getTime())) {
        allowedUpdates.dateOfBirth = dob;
      } else {
        console.warn(`Invalid dateOfBirth format received: ${dateOfBirth}`);
      }
    }
    if (address !== undefined) allowedUpdates.address = address;
    if (Object.keys(allowedUpdates).length === 0) {
      return res
        .status(400)
        .json({ message: "Không có thông tin nào được cung cấp để cập nhật." });
    }
    Object.assign(candidate, allowedUpdates);
    candidate.updatedAt = Date.now();
    const updatedCandidate = await candidate.save();
    updatedCandidate.password = undefined;

    res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công.",
      data: updatedCandidate,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ.", errors: errors });
    }
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
/////////////////////////// AVATAR //////////////////////////////
const updateMyAvatar = async (req, res) => {
  try {
    const userId = req.user.id || req.userId;
    console.log("➡️ userId từ token:", userId);

    // Tìm ứng viên bằng _id
    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      console.log("❌ Không tìm thấy candidate với userId:", userId);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        deleteFileIfExists(req.file.path);
      }
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file ảnh đại diện." });
    }

    // Xóa avatar cũ nếu có
    if (candidate.avatarUrl) {
      const oldAvatarPath = path.join(
        __dirname,
        "..",
        candidate.avatarUrl.replace(/^\//, "")
      );
      console.log("🧹 Xoá avatar cũ:", oldAvatarPath);
      deleteFileIfExists(oldAvatarPath);
    }

    // Gán avatar mới
    const newAvatarUrl = `/uploads/avatars/${req.file.filename}`;
    candidate.avatarUrl = newAvatarUrl;
    candidate.updatedAt = Date.now();

    // Lưu lại
    await candidate.save();

    console.log("✅ Cập nhật avatar thành công.");

    res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công.",
      avatarUrl: newAvatarUrl,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật avatar:", err);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      deleteFileIfExists(req.file.path);
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
      return res
        .status(400)
        .json({ message: "Lỗi validation khi lưu avatar.", errors });
    }

    res.status(500).json({
      message: "Lỗi server khi cập nhật avatar.",
      error: err.message,
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    const candidate = await Candidate.findById(userId);

    if (!candidate) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        deleteFileIfExists(req.file.path);
      }
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file ảnh đại diện." });
    }

    // Xóa avatar cũ nếu có
    if (candidate.avatarUrl) {
      const oldAvatarPath = path.join(
        __dirname,
        "..",
        candidate.avatarUrl.replace(/^\//, "")
      );
      deleteFileIfExists(oldAvatarPath);
    }

    // Gán avatar mới
    const newAvatarUrl = `/uploads/avatars/${req.file.filename}`;
    candidate.avatarUrl = newAvatarUrl;
    candidate.updatedAt = Date.now();

    // Lưu candidate vào DB
    await candidate.save();

    res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công.",
      avatarUrl: newAvatarUrl,
    });
  } catch (err) {
    console.error("❌ Error updating avatar:", err);

    // Nếu upload thành công nhưng save thất bại → xóa ảnh
    if (req.file?.path && fs.existsSync(req.file.path)) {
      deleteFileIfExists(req.file.path);
    }

    res.status(500).json({
      message: "Lỗi server khi cập nhật avatar.",
      error: err.message,
    });
  }
};
//////////////////// FAVORITES JOB////////////////////////////////
const markJobAsInterested = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const jobId = req.params.jobId;

    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }

    // Kiểm tra xem ứng viên đã yêu thích công việc này chưa
    const alreadyInterested = job.likedByCandidates.some(
      (entry) => entry.candidate.toString() === userId.toString()
    );
    if (alreadyInterested) {
      return res
        .status(400)
        .json({ message: "Ứng viên đã quan tâm công việc này rồi." });
    }

    // Thêm công việc vào danh sách yêu thích của ứng viên
    candidate.interestedJobs.push(jobId);
    await candidate.save();

    // Cập nhật trạng thái likedByCandidates của công việc
    job.likedByCandidates.push({ candidate: candidate._id });
    await job.save();

    console.log(
      `Ứng viên ${candidate.email} đã quan tâm công việc ${job.title}`
    );

    res.status(200).json({
      message: "Đã thêm vào danh sách công việc quan tâm.",
      likedJobs: candidate.interestedJobs,
    });
  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu quan tâm công việc:", err);
    res.status(500).json({
      message:
        "Đã xảy ra lỗi server khi thêm công việc vào danh sách quan tâm.",
      error: err.message,
    });
  }
};

const unmarkJobAsInterested = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const jobId = req.params.jobId;

    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const index = candidate.interestedJobs.indexOf(jobId);
    if (index === -1) {
      return res
        .status(400)
        .json({ message: "Ứng viên chưa quan tâm công việc này." });
    }
    candidate.interestedJobs.splice(index, 1);
    await candidate.save();
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc." });
    }
    job.likedByCandidates = job.likedByCandidates.filter(
      (entry) => entry.candidate.toString() !== userId.toString()
    );
    await job.save();

    console.log(
      `Ứng viên ${candidate.email} đã bỏ quan tâm công việc có ID: ${jobId}`
    );
    res
      .status(200)
      .json({ message: "Đã gỡ công việc khỏi danh sách quan tâm." });
  } catch (err) {
    console.error("Lỗi khi xử lý yêu cầu bỏ quan tâm công việc:", err);
    res.status(500).json({
      message: "Đã xảy ra lỗi server khi gỡ công việc khỏi danh sách quan tâm.",
      error: err.message,
    });
  }
};

const getInterestedJobs = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;

    const candidate = await Candidate.findById(userId).select("interestedJobs");
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const interestedJobIds = candidate.interestedJobs || [];
    if (interestedJobIds.length === 0) {
      return res.status(200).json({
        message: "Không có công việc yêu thích.",
        jobs: [],
        totalJobs: 0,
        totalPages: 0,
        currentPage: 1,
      });
    }

    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalJobs = interestedJobIds.length;
    const totalPages = Math.ceil(totalJobs / limit);

    // Cắt danh sách ID theo trang
    const paginatedJobIds = interestedJobIds.slice(skip, skip + limit);

    const jobs = await JobPosting.find({ _id: { $in: paginatedJobIds } })
      .populate({
        path: "company",
        select: "name avatarUrl city",
      })
      .lean();

    const jobsWithStatus = jobs.map((job) => ({
      ...job,
      isInterested: true,
    }));

    res.status(200).json({
      message: "Lấy danh sách công việc yêu thích thành công.",
      jobs: jobsWithStatus,
      totalJobs,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("Lỗi khi lấy công việc yêu thích:", err);
    res.status(500).json({
      message: "Lỗi server khi lấy công việc yêu thích.",
      error: err.message,
    });
  }
};

const checkIfJobIsInterested = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const jobId = req.params.jobId;

    const candidate = await Candidate.findById(userId).select("interestedJobs");
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const isInterested = candidate.interestedJobs.some(
      (id) => id.toString() === jobId
    );

    res.status(200).json({
      jobId,
      isInterested,
    });
  } catch (err) {
    console.error("Lỗi khi kiểm tra trạng thái yêu thích:", err);
    res.status(500).json({
      message: "Lỗi server khi kiểm tra trạng thái yêu thích.",
      error: err.message,
    });
  }
};
////////////////// FAVORITES COMPANY ////////////////////////
const addCompanyToFavorites = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const companyId = req.params.companyId;

    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Không tìm thấy công ty." });
    }

    const alreadyLiked = candidate.likedCompanies.includes(companyId);
    if (alreadyLiked) {
      return res
        .status(400)
        .json({ message: "Ứng viên đã yêu thích công ty này rồi." });
    }

    candidate.likedCompanies.push(companyId);
    await candidate.save();

    res
      .status(200)
      .json({ message: "Đã thêm công ty vào danh sách yêu thích." });
  } catch (err) {
    console.error("Lỗi khi thêm công ty vào yêu thích:", err);
    res.status(500).json({
      message: "Lỗi server khi thêm công ty vào yêu thích.",
      error: err.message,
    });
  }
};
const removeCompanyFromFavorites = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const companyId = req.params.companyId;

    const candidate = await Candidate.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const index = candidate.likedCompanies.indexOf(companyId);
    if (index === -1) {
      return res
        .status(400)
        .json({ message: "Ứng viên chưa yêu thích công ty này." });
    }

    candidate.likedCompanies.splice(index, 1);
    await candidate.save();

    res
      .status(200)
      .json({ message: "Đã bỏ công ty khỏi danh sách yêu thích." });
  } catch (err) {
    console.error("Lỗi khi bỏ công ty khỏi yêu thích:", err);
    res.status(500).json({
      message: "Lỗi server khi bỏ công ty khỏi yêu thích.",
      error: err.message,
    });
  }
};
const getLikedCompanies = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const candidate = await Candidate.findById(userId).populate(
      "likedCompanies"
    );

    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCompanies = candidate.likedCompanies.slice(
      startIndex,
      endIndex
    );
    const totalCompanies = candidate.likedCompanies.length;

    res.status(200).json({
      message: "Lấy danh sách công ty yêu thích thành công.",
      companies: paginatedCompanies,
      totalCompanies,
      totalPages: Math.ceil(totalCompanies / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách công ty yêu thích:", err);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách công ty yêu thích.",
      error: err.message,
    });
  }
};
const checkIfCompanyIsLiked = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Xác thực không hợp lệ." });
    }

    const userId = req.userId;
    const companyId = req.params.companyId;

    const candidate = await Candidate.findById(userId).select("likedCompanies");
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const isLiked = candidate.likedCompanies.some(
      (id) => id.toString() === companyId
    );

    res.status(200).json({
      companyId,
      isLiked,
    });
  } catch (err) {
    console.error("Lỗi khi kiểm tra trạng thái yêu thích công ty:", err);
    res.status(500).json({
      message: "Lỗi server khi kiểm tra trạng thái yêu thích công ty.",
      error: err.message,
    });
  }
};
//////////////// TẠO CV //////////////////////////////
const updateStructuredCV = async (req, res) => {
  try {
    const candidateId = req.userId;
    const {
      summary,
      education,
      experience,
      skills,
      languages,
      certifications,
      projects,
    } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.structuredCV = {
      summary,
      education,
      experience,
      skills,
      languages,
      certifications,
      projects,
    };

    await candidate.save();

    res.status(200).json({
      message: "CV updated successfully",
      structuredCV: candidate.structuredCV,
    });
  } catch (error) {
    console.error("Error updating CV:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getStructuredCV = async (req, res) => {
  try {
    const candidateId = req.userId;

    const candidate = await Candidate.findById(candidateId).select(
      "structuredCV"
    );

    if (!candidate || !candidate.structuredCV) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.status(200).json({
      message: "Fetched CV successfully",
      structuredCV: candidate.structuredCV,
    });
  } catch (error) {
    console.error("Error fetching CV:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  checkIfCompanyIsLiked,
  uploadCV,
  getCandidateInfoByID,
  getMyInfo,
  updateCV,
  updateMyInfo,
  updateMyAvatar,
  deleteCV,
  applyToJob,
  unapplyFromJob,
  createOrUpdateReview,
  getCompanyWithReviews,
  updateReview,
  checkAppliedStatus,
  uploadAvatar,
  markJobAsInterested,
  unmarkJobAsInterested,
  getInterestedJobs,
  addCompanyToFavorites,
  removeCompanyFromFavorites,
  getLikedCompanies,
  checkIfJobIsInterested,
  updateStructuredCV,
  getStructuredCV,
};
