const mongoose = require("mongoose");
const Admin = require("./models/Admin");

require("dotenv").config();

if (!process.env.MONGODB_URL) {
  console.error(
    "❌ MONGODB_URL không được load. Hãy kiểm tra lại file .env và vị trí file."
  );
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      return process.exit(0);
    }
    const admin = new Admin({
      username: "admin",
      password: "admin123",
    });

    await admin.save();
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
