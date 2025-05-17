const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ email, subject, message }) => {
  try {
    if (
      !process.env.MAIL_USER ||
      !process.env.MAIL_PASS ||
      !process.env.EMAIL_FROM
    ) {
      throw new Error(
        "⚠️ MAIL_USER, MAIL_PASS hoặc EMAIL_FROM chưa được cấu hình trong .env"
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email đã gửi đến ${email}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
  }
};

module.exports = sendEmail;
