const Company = require("../models/Company");
const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/email");
const Candidate = require("../models/Candidate");
const JobPosting = require("../models/JobPosting");
const Blog = require("../models/Blog");
const Package = require("../models/Package");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//////////////////////////////////////ADMIN//////////////////////////////////
///////// AUTH
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log("Đang xử lý đăng nhập...");

    const admin = await Admin.findOne({ username }).select("+password");
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
    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      admin: {
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
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
        .populate("company")
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
    const user = await User.findById(id);
    if (!user || user.role !== "employer") {
      return res.status(404).json({
        message: "Không tìm thấy người dùng hoặc không phải nhà tuyển dụng.",
      });
    }
    user.isActive = true;
    user.isRejected = false;
    await user.save();
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
    const [companyCount, employerCount, candidateCount, jobCount, jobsPerDay] =
      await Promise.all([
        Company.countDocuments(),
        User.countDocuments({ role: "employer" }),
        Candidate.countDocuments({ role: "candidate" }),
        JobPosting.countDocuments(),
        JobPosting.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    res.status(200).json({
      message: "Thống kê thành công.",
      data: {
        companies: companyCount,
        employers: employerCount,
        candidates: candidateCount,
        jobs: jobCount,
        jobsPerDay: jobsPerDay,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      role: "employer",
      $or: [{ email: { $regex: search, $options: "i" } }],
    };

    const total = await User.countDocuments(query);
    const employers = await User.find(query)
      .select("-password")
      .populate("company")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Lấy danh sách người tuyển dụng thành công.",
      employers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách employers:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};

/// Xem tất cả candidate hiện có
exports.getAllCandidates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      role: "candidate",
      $or: [{ email: { $regex: search, $options: "i" } }],
    };

    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Lấy danh sách ứng viên thành công.",
      candidates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
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
    const search = req.query.search || "";

    const query = {
      title: { $regex: search, $options: "i" },
    };

    const totalJobs = await JobPosting.countDocuments(query);
    const jobPostings = await JobPosting.find(query)
      .skip(skip)
      .limit(limit)
      .populate("company")
      .populate("employer");

    res.status(200).json({
      message: "Lấy danh sách công việc thành công.",
      jobPostings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách công việc:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu." });
  }
};
exports.deleteJobByAdmin = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Công việc không tồn tại." });
    }

    await JobPosting.findByIdAndDelete(jobId);
    res.status(200).json({ message: "Công việc đã được xóa thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa công việc:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa công việc." });
  }
};
////////////////////////// QUẢN LÝ GÓI ///////////////////////
exports.createPackage = async (req, res) => {
  try {
    const { name, label, description, posts, priceVND, duration } = req.body;
    if (!name || !label || !posts || !priceVND || !duration) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const existing = await Package.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Tên gói đã tồn tại." });
    }
    const product = await stripe.products.create({ name: label, description });
    const price = await stripe.prices.create({
      unit_amount: priceVND,
      currency: "vnd",
      product: product.id,
    });
    const newPackage = new Package({
      name,
      label,
      description,
      posts,
      priceVND,
      duration,
      priceId: price.id,
    });

    await newPackage.save();
    res
      .status(201)
      .json({ message: "Gói đã được tạo thành công.", data: newPackage });
  } catch (error) {
    console.error("Lỗi tạo gói:", error);
    res.status(500).json({ message: "Lỗi khi tạo gói." });
  }
};
exports.getPackage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { label: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [packages, total] = await Promise.all([
      Package.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Package.countDocuments(query),
    ]);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: packages,
    });
  } catch (error) {
    console.error("Lỗi tìm kiếm/phân trang gói:", error);
    res.status(500).json({ message: "Không thể lấy danh sách gói." });
  }
};

exports.getPackageByName = async (req, res) => {
  try {
    const found = await Package.findOne({ name: req.params.name });
    if (!found) return res.status(404).json({ message: "Không tìm thấy gói." });
    res.json(found);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tìm gói." });
  }
};
exports.updatePackage = async (req, res) => {
  try {
    const { label, description, posts, priceVND, duration } = req.body;
    if (!label || !posts || !priceVND || !duration) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    const updated = await Package.findByIdAndUpdate(
      req.params.id,
      { label, description, posts, priceVND, duration },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy gói để cập nhật." });
    }

    res.json({ message: "Đã cập nhật gói thành công.", data: updated });
  } catch (error) {
    console.error("🔥 Chi tiết lỗi khi cập nhật gói:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Lỗi khi cập nhật gói.",
      error: error.message,
    });
  }
};
exports.deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy gói để xoá." });
    res.json({ message: "Đã xoá gói thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá gói." });
  }
};
