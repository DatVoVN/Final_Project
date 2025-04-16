const Candidate = require("../models/Candidate");
const path = require("path");
const fs = require("fs");
const JobPosting = require("../models/JobPosting");
// Ứng tuyển
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

    // Tìm ứng viên
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Không tìm thấy ứng viên." });
    }

    const appliedIndex = candidate.appliedJobs.findIndex(
      (id) => id.toString() === jobId
    );
    if (appliedIndex === -1) {
      return res
        .status(400)
        .json({ message: "Bạn chưa ứng tuyển bài đăng này." });
    }

    candidate.appliedJobs.splice(appliedIndex, 1);
    await candidate.save();

    // Xóa ứng viên khỏi job.applicants
    await JobPosting.updateOne(
      { _id: jobId },
      { $pull: { applicants: { candidate: candidateId } } }
    );

    // Kiểm tra lại dữ liệu job sau khi cập nhật
    const updatedJob = await JobPosting.findById(jobId);

    res.status(200).json({ message: "Huỷ ứng tuyển thành công." });
  } catch (error) {
    console.error("Lỗi khi huỷ ứng tuyển:", error);
    res.status(500).json({ message: "Lỗi server khi huỷ ứng tuyển." });
  }
};

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
// Controller cập nhật CV (chỉ cho user tự cập nhật)
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
// Controller lấy thông tin ứng viên theo ID
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
// Controller lấy thông tin cá nhân của ứng viên đang đăng nhập
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
// Controller cập nhật thông tin cá nhân
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
const updateMyAvatar = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: userId }); // Hoặc tên trường đúng
    console.log("Candidate found:", candidate); // Log kết quả tìm kiếm

    if (!candidate) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
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
    if (candidate.avatarUrl) {
      deleteFileIfExists(candidate.avatarUrl);
    }
    const newAvatarUrl = `/uploads/avatars/${req.file.filename}`;
    candidate.avatarUrl = newAvatarUrl;
    candidate.updatedAt = Date.now();
    await candidate.save();

    res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công.",
      avatarUrl: newAvatarUrl,
    });
  } catch (err) {
    console.error("Error updating avatar:", err);
    // Xóa file vừa upload nếu có lỗi xảy ra trong quá trình xử lý DB
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      console.log(
        `Attempting to delete uploaded avatar file due to error: ${req.file.path}`
      );
      // Chuyển đổi path tương đối nếu cần trước khi xóa
      deleteFileIfExists(req.file.path); // Thử xóa bằng helper
    }
    // Xử lý lỗi Validation (ít gặp với upload file trừ khi có hook phức tạp)
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
      return res
        .status(400)
        .json({ message: "Lỗi validation khi lưu avatar.", errors: errors });
    }
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật avatar.", error: err.message });
  }
};
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
module.exports = {
  uploadCV,
  getCandidateInfoByID,
  getMyInfo,
  updateCV,
  updateMyInfo,
  updateMyAvatar,
  deleteCV,
  applyToJob,
  unapplyFromJob,
};
