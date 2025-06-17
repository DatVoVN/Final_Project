const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const Candidate = require("../models/Candidate");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/email");
const authController = {
  ////////////////////////// AUTH /////////////////////////
  /// Đăng kí developer
  registerEmployer: async (req, res) => {
    try {
      const {
        email,
        password,
        fullName,
        phoneNumber,
        companyName,
        taxCode,
        city,
      } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại." });
      }
      const existingCompany = await Company.findOne({ taxCode });
      if (existingCompany) {
        return res.status(400).json({
          message: "Mã số thuế đã tồn tại. Không thể đăng ký công ty.",
        });
      }
      const company = new Company({
        name: companyName,
        taxCode,
        city,
      });
      await company.save();
      const newUser = new User({
        email,
        password,
        fullName,
        phoneNumber,
        company: company._id,
        role: "employer",
        isActive: false,
        isRejected: false,
      });
      await newUser.save();

      res.status(201).json({
        message: "Tài khoản đã được tạo, chờ admin duyệt.",
      });
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      res.status(500).json({ message: "Lỗi server." });
    }
  },

  /// Đăng nhập developer
  loginEmployer: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập email và mật khẩu." });
      }
      const user = await User.findOne({ email }).select("+password");

      if (!user || user.role !== "employer") {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng." });
      }
      if (!user.isActive) {
        return res
          .status(403)
          .json({ message: "Tài khoản chưa được admin duyệt." });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng." });
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        message: "Đăng nhập thành công.",
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ message: "Lỗi server." });
    }
  },
  ////////////////////////////CANDIDATE////////////////////
  /// Đăng kí ứng viên
  registerCandidate: async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const existingCandidate = await Candidate.findOne({
        email: normalizedEmail,
      });

      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      let candidateToProcess;
      if (existingCandidate) {
        if (existingCandidate.isVerified) {
          return res
            .status(400)
            .json({ message: "Email đã được đăng ký và xác thực." });
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          existingCandidate.password = hashedPassword;
          existingCandidate.fullName = fullName;
          existingCandidate.otp = otp;
          existingCandidate.otpExpires = otpExpires;
          candidateToProcess = existingCandidate;
        }
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        candidateToProcess = new Candidate({
          fullName,
          email: normalizedEmail,
          password: hashedPassword,
          otp,
          otpExpires,
          isVerified: false,
          role: "candidate",
        });
      }

      await sendEmail({
        email: normalizedEmail,
        subject: "Xác thực tài khoản",
        message: `Mã OTP của bạn là: ${otp}`,
      });
      try {
        await sendEmail({
          email: normalizedEmail,
          subject: "Xác thực tài khoản",
          message: `Mã OTP của bạn là: ${otp}`,
        });
      } catch (error) {
        console.error(`Failed to send OTP email to ${normalizedEmail}:`, error);
        return res
          .status(500)
          .json({ message: "Lỗi hệ thống khi gửi email xác thực." });
      }

      await candidateToProcess.save();

      res.status(200).json({
        message:
          "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã.",
        email: normalizedEmail,
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký Candidate:", error);
      if (error.code === 11000)
        return res.status(400).json({ message: "Email này đã được sử dụng." });
      res.status(500).json({ message: "Lỗi server trong quá trình đăng ký." });
    }
  },
  /// Gửi mã OTP và resend lại mã OTP
  resendOtp: async (req, res) => {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Vui lòng cung cấp email." });
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const candidate = await Candidate.findOne({ email: normalizedEmail });

      if (!candidate || candidate.isVerified) {
        return res.status(400).json({
          message:
            "Nếu email đã đăng ký và chưa xác thực, OTP sẽ được gửi lại.",
        });
      }

      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      candidate.otp = otp;
      candidate.otpExpires = otpExpires;

      await sendEmail({
        email: normalizedEmail,
        subject: "Xác thực tài khoản",
        message: `Mã OTP của bạn là: ${otp}`,
      });
      try {
        await sendEmail({
          email: normalizedEmail,
          subject: "Xác thực tài khoản",
          message: `Mã OTP của bạn là: ${otp}`,
        });
      } catch (error) {
        console.error(`Failed to send OTP email to ${normalizedEmail}:`, error);
        return res
          .status(500)
          .json({ message: "Lỗi hệ thống khi gửi email xác thực." });
      }

      await candidate.save();

      res
        .status(200)
        .json({ message: "Mã OTP mới đã được gửi lại đến email của bạn." });
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      res.status(500).json({ message: "Lỗi server khi gửi lại OTP." });
    }
  },
  verifyOtp: async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp email và mã OTP." });
    }
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const candidate = await Candidate.findOne({ email: normalizedEmail });

      if (!candidate) {
        return res
          .status(400)
          .json({ message: "Email không tồn tại hoặc OTP không hợp lệ." });
      }
      if (candidate.isVerified) {
        return res
          .status(400)
          .json({ message: "Tài khoản này đã được xác thực trước đó." });
      }
      if (candidate.otp !== otp) {
        return res.status(400).json({ message: "Mã OTP không chính xác." });
      }
      if (!candidate.otpExpires || candidate.otpExpires < Date.now()) {
        return res
          .status(400)
          .json({ message: "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại." });
      }

      candidate.isVerified = true;
      candidate.otp = undefined;
      candidate.otpExpires = undefined;
      await candidate.save();
      res.status(200).json({
        message: "Xác thực tài khoản thành công! Bạn có thể đăng nhập.",
      });
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      res.status(500).json({ message: "Lỗi server khi xác thực OTP." });
    }
  },
  /// Đăng nhập ứng viên
  loginCandidate: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập email và mật khẩu." });
      }
      const normalizedEmail = email.toLowerCase().trim();
      const candidate = await Candidate.findOne({
        email: normalizedEmail,
      }).select("+password");

      if (!candidate) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng." });
      }

      // *** KIỂM TRA XÁC THỰC ***
      if (!candidate.isVerified) {
        return res.status(403).json({
          message:
            "Tài khoản chưa được xác thực. Vui lòng kiểm tra email hoặc yêu cầu gửi lại OTP.",
          verificationRequired: true,
          email: normalizedEmail,
        });
      }

      const isMatch = await bcrypt.compare(password, candidate.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng." });
      }
      const token = jwt.sign(
        { id: candidate._id, email: candidate.email, role: "candidate" },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );
      candidate.password = undefined;

      res.status(200).json({
        message: "Đăng nhập thành công!",
        token,
        candidate: {
          id: candidate._id,
          fullName: candidate.fullName,
          email: candidate.email,
        },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Candidate:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },
  /// Đắng xuất ứng viên
  logoutCandidate: async (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Đăng xuất thành công!" });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      res.status(500).json({ message: "Lỗi server khi đăng xuất." });
    }
  },
  /// Quên mật khẩu ứng viên
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const candidate = await Candidate.findOne({ email });
      if (!candidate) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tài khoản ứng viên." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      candidate.otp = otp;
      candidate.otpExpires = otpExpires;
      await candidate.save();

      await sendEmail({
        email: candidate.email,
        subject: "OTP khôi phục mật khẩu",
        message: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 10 phút.`,
      });

      res.status(200).json({ message: "Mã OTP đã được gửi qua email." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Đã xảy ra lỗi." });
    }
  },
  /// Quên mật khẩu rồi thì cập nhật lại mật khẩu
  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const candidate = await Candidate.findOne({ email });

      if (
        !candidate ||
        candidate.otp !== otp ||
        candidate.otpExpires < Date.now()
      ) {
        return res
          .status(400)
          .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      candidate.password = hashedPassword;
      candidate.otp = undefined;
      candidate.otpExpires = undefined;
      await candidate.save();

      res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Đã xảy ra lỗi." });
    }
  },
  /// Đổi mật khẩu khi mình đã đăng nhập
  changePassword: async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const candidateId = req.userId;

    try {
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Không tìm thấy ứng viên." });
      }

      const isMatch = await bcrypt.compare(oldPassword, candidate.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      candidate.password = hashed;
      await candidate.save();

      res.status(200).json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  },
  forgotPasswordE: async (req, res) => {
    const { email } = req.body;
    try {
      const employer = await User.findOne({ email });
      if (!employer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tài khoản nhà tuyển dụng." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      employer.otp = otp;
      employer.otpExpires = otpExpires;
      await employer.save();

      await sendEmail({
        email: employer.email,
        subject: "OTP khôi phục mật khẩu",
        message: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 10 phút.`,
      });

      res.status(200).json({ message: "Mã OTP đã được gửi qua email." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Đã xảy ra lỗi." });
    }
  },
  /// Quên mật khẩu rồi thì cập nhật lại mật khẩu
  resetPasswordE: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const employer = await User.findOne({ email }).select("+password");

      if (
        !employer ||
        employer.otp !== otp ||
        employer.otpExpires < Date.now()
      ) {
        return res
          .status(400)
          .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });
      }
      employer.password = newPassword;
      employer.otp = undefined;
      employer.otpExpires = undefined;

      await employer.save();

      res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Đã xảy ra lỗi." });
    }
  },
  /// Đổi mật khẩu khi mình đã đăng nhập
  changePasswordE: async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const employerId = req.user.id;

    try {
      const employer = await User.findById(employerId).select("+password");

      if (!employer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy nhà tuyển dụng." });
      }

      const isMatch = await bcrypt.compare(oldPassword, employer.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
      }

      employer.password = newPassword;
      await employer.save();

      res.status(200).json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  },
};

module.exports = authController;
