const fs = require("fs");

/**
 * Xoá file nếu tồn tại.
 * @param {string} filePath - Đường dẫn tuyệt đối đến file cần xoá.
 */
const deleteFileIfExists = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Đã xoá file: ${filePath}`);
    } else {
      console.log(`File không tồn tại: ${filePath}`);
    }
  } catch (err) {
    console.error("Lỗi khi xoá file:", err);
  }
};

module.exports = deleteFileIfExists;
