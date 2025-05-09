const multer = require("multer");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

// Tạo thư mục lưu trữ nếu chưa có
const uploadDir = path.join(__dirname, "../uploads/blogs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeName = slugify(baseName, { lower: true, strict: true });
    const uniqueName = `${Date.now()}-${safeName}${ext}`;
    cb(null, uniqueName);
  },
});

// Lọc file: chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra kiểu tệp là ảnh
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File không hợp lệ. Chỉ chấp nhận ảnh."), false);
  }
};

// Cấu hình upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
});

module.exports = upload;
