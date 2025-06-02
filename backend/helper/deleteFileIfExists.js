const fs = require("fs");
const path = require("path");

/**
 * Xóa file nếu tồn tại.
 * @param {string} filePath
 */
const deleteFileIfExists = (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    } else {
      console.warn(`File không tồn tại: ${absolutePath}`);
    }
  } catch (err) {
    console.error("Lỗi khi xóa file:", err);
  }
};

module.exports = deleteFileIfExists;
