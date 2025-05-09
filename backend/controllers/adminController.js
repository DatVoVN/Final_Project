const Company = require("../models/Company");
const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/email");
const Candidate = require("../models/Candidate");
const JobPosting = require("../models/JobPosting");
//////////////////////////////////////ADMIN//////////////////////////////////
///////// AUTH
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log("Đang xử lý đăng nhập...");

    const admin = await Admin.findOne({ username }).select("+password");
    console.log(admin);

    if (!admin) {
      console.log("Không tìm thấy admin với username:", username);
      return res.status(401).json({ message: "Tên đăng nhập không tồn tại" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log("Mật khẩu không khớp");
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    console.log("Đăng nhập thành công! Token:", token);

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      admin: {
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};
//////// QUẢN LÝ VIỆC ĐĂNG KÍ DEVELOPER
/// Lấy xam danh sách đăng kí nhà tuyển dụng
exports.getPendingEmployers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, pendingEmployers] = await Promise.all([
      User.countDocuments({
        role: "employer",
        isActive: false,
        isRejected: false,
      }),
      User.find({
        role: "employer",
        isActive: false,
        isRejected: false,
      })
        .populate("company") // Lấy thông tin công ty liên quan
        .skip(skip)
        .limit(limit),
    ]);
    const employersWithCompanyDetails = pendingEmployers.map((user) => {
      const companyName = user.company ? user.company.name : null;
      const taxCode = user.company ? user.company.taxCode : null;
      return {
        ...user.toObject(),
        companyName,
        taxCode,
      };
    });

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items: employersWithCompanyDetails,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

/// Chấp nhận đăng kí
exports.approveEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm user theo ID
    const user = await User.findById(id);
    if (!user || user.role !== "employer") {
      return res.status(404).json({
        message: "Không tìm thấy người dùng hoặc không phải nhà tuyển dụng.",
      });
    }

    // Cập nhật trạng thái duyệt
    user.isActive = true;
    user.isRejected = false;
    await user.save();

    // Gửi email thông báo duyệt
    await sendEmail({
      email: user.email,
      subject: "Tài khoản của bạn đã được duyệt",
      message: `Xin chào ${user.fullName},\n\nTài khoản nhà tuyển dụng của bạn đã được admin duyệt. Bạn có thể đăng nhập và sử dụng hệ thống.\n\nTrân trọng.`,
    });

    res.status(200).json({ message: "Duyệt thành công và đã gửi email." });
  } catch (error) {
    console.error("Lỗi duyệt:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
/// Từ chối đăng kí
exports.rejectEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("company");

    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    if (user.company) {
      const otherEmployers = await User.countDocuments({
        company: user.company._id,
      });
      if (otherEmployers === 1) {
        await Company.findByIdAndDelete(user.company._id);
      }
    }

    // Gửi email trước khi xóa user
    await sendEmail({
      email: user.email,
      subject: "Tài khoản của bạn đã bị từ chối",
      message: `Xin chào ${user.fullName}, rất tiếc, tài khoản của bạn đã bị từ chối.`,
    });

    // Xóa user
    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Đã từ chối và xóa tài khoản, gửi email thành công." });
  } catch (error) {
    console.error("Lỗi từ chối:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
//////// THỐNG KÊ
/// Thống kê
exports.getSummaryStats = async (req, res) => {
  try {
    const [companyCount, employerCount, candidateCount] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments({ role: "employer" }),
      Candidate.countDocuments({ role: "candidate" }),
    ]);

    res.status(200).json({
      message: "Thống kê thành công.",
      data: {
        companies: companyCount,
        employers: employerCount,
        candidates: candidateCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
/////////////////////////// CRUD //////////////////////////////////
/// Xóa developer
exports.deleteEmployerByAdmin = async (req, res) => {
  try {
    const employerId = req.params.id;

    const employer = await User.findById(employerId);
    if (!employer) {
      return res
        .status(404)
        .json({ message: "Người tuyển dụng không tồn tại." });
    }

    if (employer.role !== "employer") {
      return res
        .status(400)
        .json({ message: "Người dùng này không phải là nhà tuyển dụng." });
    }

    const companyId = employer.company;
    await User.findByIdAndDelete(employerId);
    const remainingUsers = await User.find({ company: companyId });

    if (remainingUsers.length === 0) {
      await JobPosting.deleteMany({ company: companyId });
      await Company.findByIdAndDelete(companyId);
    }
    res
      .status(200)
      .json({ message: "Đã xoá nhà tuyển dụng và dữ liệu liên quan." });
  } catch (error) {
    console.error("Lỗi khi xoá nhà tuyển dụng:", error);
    res.status(500).json({ message: "Lỗi server trong quá trình xoá." });
  }
};
/// Xem tất cả developer hiện có
exports.getAllEmployers = async (req, res) => {
  try {
    const employers = await User.find({ role: "employer" })
      .select("-password")
      .populate("company");

    if (!employers.length) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người tuyển dụng." });
    }

    res.status(200).json({
      message: "Lấy danh sách người tuyển dụng thành công.",
      employers: employers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người tuyển dụng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
/// Xem tất cả candidate hiện có
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ role: "candidate" }).select(
      "-password"
    );

    if (!candidates.length) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người ứng viên nào." });
    }

    res.status(200).json({
      message: "Lấy danh sách ứng viên thành công.",
      candidates: candidates,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ứng viên:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
/// Xóa candidate
exports.deleteCandidateByAdmin = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Ứng viên không tồn tại." });
    }

    if (candidate.role !== "candidate") {
      return res
        .status(400)
        .json({ message: "Người dùng này không phải là ứng viên." });
    }
    await Candidate.findByIdAndDelete(candidateId);
    await JobPosting.updateMany(
      { "applicants.candidate": candidateId },
      { $pull: { applicants: { candidate: candidateId } } }
    );

    res.status(200).json({ message: "Ứng viên đã được xóa thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa ứng viên:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa ứng viên." });
  }
};
/// Xem tất cả job hiện có

exports.getAllJob = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobPostings = await JobPosting.find({})
      .skip(skip)
      .limit(limit)
      .select("-password")
      .populate("company")
      .populate("employer");

    if (!jobPostings.length) {
      return res.status(404).json({ message: "Không tìm thấy công việc nào." });
    }
    const totalJobs = await JobPosting.countDocuments({});
    const totalPages = Math.ceil(totalJobs / limit);

    res.status(200).json({
      message: "Lấy danh sách công việc thành công.",
      jobPostings: jobPostings,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalJobs: totalJobs,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách công việc:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
