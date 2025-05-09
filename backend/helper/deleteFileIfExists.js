const fs = require("fs");
const path = require("path");

/**
 * Xóa file nếu tồn tại.
 * @param {string} filePath - Đường dẫn tuyệt đối đến file cần xóa.
 */
const deleteFileIfExists = (filePath) => {
  try {
    const absolutePath = path.resolve(filePath); // đảm bảo là đường dẫn tuyệt đối
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`✅ Đã xóa file: ${absolutePath}`);
    } else {
      console.warn(`⚠️ File không tồn tại: ${absolutePath}`);
    }
  } catch (err) {
    console.error("❌ Lỗi khi xóa file:", err);
  }
};

module.exports = deleteFileIfExists;
