registerEmployer = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, company } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    const newUser = new User({
      email,
      password,
      fullName,
      phoneNumber,
      company,
      role: "employer",
      isActive: false,
    });
    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "admin@example.com", // Email của admin để duyệt tài khoản
      subject: "Có tài khoản người tuyển dụng cần duyệt",
      text: `Người tuyển dụng mới đã đăng ký với email: ${email}. Vui lòng duyệt tài khoản này.`,
    };

    // Gửi email thông báo cho admin
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Lỗi gửi email: ", error);
      } else {
        console.log("Email đã gửi thành công: " + info.response);
      }
    });

    res.status(200).json({
      message: "Đăng ký thành công. Vui lòng đợi admin duyệt tài khoản.",
    });
  } catch (error) {
    console.error("Lỗi đăng ký người tuyển dụng: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
module.exports = developerController;
