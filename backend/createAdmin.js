const mongoose = require("mongoose");
const Admin = require("./models/Admin");

require("dotenv").config();

// DEBUG: In ra toàn bộ .env để kiểm tra
console.log("🌐 MONGODB_URL =", process.env.MONGODB_URL);
if (!process.env.MONGODB_URL) {
  console.error(
    "❌ MONGODB_URL không được load. Hãy kiểm tra lại file .env và vị trí file."
  );
  process.exit(1);
}

const createAdmin = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Kết nối MongoDB thành công!");

    // Kiểm tra admin đã tồn tại chưa
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      console.log("⚠️ Admin đã tồn tại.");
      return process.exit(0);
    }

    // Tạo admin mới
    const admin = new Admin({
      username: "admin",
      password: "admin123",
    });

    await admin.save();
    console.log("✅ Admin được tạo thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
