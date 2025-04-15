const Company = require("../models/Company");
const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/email");

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
exports.getPendingEmployers = async (req, res) => {
  try {
    const pendingEmployers = await User.find({
      role: "employer",
      isActive: false,
      isRejected: false,
    }).populate("company"); // Populate thông tin công ty

    res.status(200).json(pendingEmployers);
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

exports.approveEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm user theo ID
    const user = await User.findById(id);
    if (!user || user.role !== "employer") {
      return res
        .status(404)
        .json({
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

exports.rejectEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Gửi email trước khi xóa
    await sendEmail({
      email: user.email,
      subject: "Tài khoản của bạn đã bị từ chối",
      message: `Xin chào ${user.fullName}, rất tiếc, tài khoản của bạn đã bị từ chối.`,
    });

    // Xoá user
    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Đã từ chối và xóa tài khoản, gửi email thành công." });
  } catch (error) {
    console.error("Lỗi từ chối:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

// exports.getPendingCompanies = async (req, res) => {
//   try {
//     const companies = await Company.find({ status: "pending" })
//       .populate("createdBy", "fullName email phoneNumber")
//       .sort({ createdAt: -1 });
//     res.status(200).json({
//       status: "success",
//       results: companies.length,
//       data: { companies },
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ status: "fail", message: "Could not fetch pending companies." });
//   }
// };
// const updateCompanyStatusAndNotify = async (companyId, status, res) => {
//   try {
//     const company = await Company.findByIdAndUpdate(
//       companyId,
//       { status },
//       { new: true, runValidators: true }
//     );
//     if (!company)
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Company not found." });

//     const user = await User.findOne({ company: company._id });
//     if (user) {
//       const subject =
//         status === "approved"
//           ? "Tài khoản Nhà tuyển dụng của bạn đã được duyệt!"
//           : "Thông tin đăng ký Nhà tuyển dụng của bạn bị từ chối";
//       const message =
//         status === "approved"
//           ? `Chào ${user.fullName},\n\nTài khoản Nhà tuyển dụng của bạn cho công ty "${company.companyName}" đã được phê duyệt.\n\nBây giờ bạn có thể đăng nhập và bắt đầu đăng tin tuyển dụng tại [Link đăng nhập].\n\nTrân trọng,\nĐội ngũ [Tên ứng dụng của bạn]`
//           : `Chào ${user.fullName},\n\nChúng tôi rất tiếc phải thông báo rằng đăng ký của bạn cho công ty "${company.companyName}" đã không được phê duyệt.\n\nLý do: [Admin có thể cần cung cấp lý do - hiện chưa có].\n\nNếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ.\n\nTrân trọng,\nĐội ngũ [Tên ứng dụng của bạn]`;

//       sendEmail({ email: user.email, subject, message }).catch((err) =>
//         console.error(`Failed to send ${status} email:`, err)
//       );
//     } else {
//       console.warn(
//         `Could not find user associated with company ID ${company._id} for notification.`
//       );
//     }

//     res.status(200).json({ status: "success", data: { company } });
//   } catch (error) {
//     console.error(
//       `Error ${status === "approved" ? "approving" : "rejecting"} company:`,
//       error
//     );
//     res
//       .status(500)
//       .json({ status: "fail", message: `Could not ${status} company.` });
//   }
// };
// exports.approveCompany = async (req, res) => {
//   await updateCompanyStatusAndNotify(req.params.companyId, "approved", res);
// };
// exports.rejectCompany = async (req, res) => {
//   await updateCompanyStatusAndNotify(req.params.companyId, "rejected", res);
// };
