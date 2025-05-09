const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { protectAdmin } = require("../middleware/authMiddleware");
////////////////////////// BLOG ////////////////////////////////
/// lấy tất cả blog
router.get("/", blogController.getAllBlogs);
// Thêm blog
router.post("/", protectAdmin, blogController.createBlog);
// Cập nhật blog
router.put("/:id", protectAdmin, blogController.updateBlog);
// Xóa blog
router.delete("/:id", protectAdmin, blogController.deleteBlog);
// lấy blog theo id
router.get("/:id", blogController.getBlogById);
module.exports = router;
