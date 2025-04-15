// utils/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Đảm bảo đã cài dotenv

const transporterOptions = {
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587", 10), // Chuyển sang số
  secure: process.env.MAIL_PORT === "465",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

// *** LOG KIỂM TRA ***
console.log(">>> Nodemailer Transporter Options:", transporterOptions);

const transporter = nodemailer.createTransport(transporterOptions);
const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.MAIL_USER}>`, // Tên và địa chỉ người gửi
    to: toEmail,
    subject: "Mã Xác Thực Đăng Ký Tài Khoản",
    text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`, // Nội dung text
    html: `
      <p>Chào bạn,</p>
      <p>Cảm ơn bạn đã đăng ký. Mã OTP để xác thực tài khoản của bạn là:</p>
      <h2 style="font-size: 24px; font-weight: bold; color: #333;">${otp}</h2>
      <p>Mã này sẽ hết hạn sau 10 phút.</p>
      <p>Trân trọng,<br/>Đội ngũ Your App Name</p>
    `, // Nội dung HTML (tùy chọn)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`Error sending OTP email to ${toEmail}:`, error);
    return false;
  }
};

module.exports = { sendOtpEmail };
