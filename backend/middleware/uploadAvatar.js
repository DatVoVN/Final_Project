// // Ví dụ: middleware/uploadAvatar.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const avatarStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = path.join(__dirname, "..", "uploads", "avatars");
//     fs.mkdirSync(uploadPath, { recursive: true });
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const avatarFileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Chỉ chấp nhận file hình ảnh!"), false);
//   }
// };

// const uploadAvatar = multer({
//   storage: avatarStorage,
//   fileFilter: avatarFileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// module.exports = uploadAvatar;
// middleware/uploadAvatar.js
const multer = require("multer");

const avatarStorage = multer.memoryStorage();

const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file hình ảnh!"), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = uploadAvatar;
