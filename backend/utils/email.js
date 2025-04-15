const sgMail = require("@sendgrid/mail");
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY chưa được cấu hình trong .env");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ email, subject, message }) => {
  try {
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM chưa được cấu hình trong .env");
    }

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject,
      text: message,
    };

    await sgMail.send(msg);
    console.log(`✅ Email đã gửi đến ${email}`);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error?.response?.body || error.message);
  }
};

module.exports = sendEmail;
