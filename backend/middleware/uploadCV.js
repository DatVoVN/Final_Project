// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const cvDirectory = path.join(__dirname, "../uploads/cv");
// if (!fs.existsSync(cvDirectory)) {
//   fs.mkdirSync(cvDirectory, { recursive: true });
// }
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, cvDirectory);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, "cv-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Chỉ chấp nhận file PDF!"), false);
//   }
// };

// const uploadCV = multer({ storage, fileFilter });

// module.exports = uploadCV;
// middleware/uploadCV.js
const multer = require("multer");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file PDF!"), false);
  }
};
const uploadCV = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = uploadCV;
