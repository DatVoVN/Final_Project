const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { protectAdmin } = require("../middleware/authMiddleware");
router.get("/", blogController.getAllBlogs);
// Thêm blog
router.post("/", protectAdmin, blogController.createBlog);
// Cập nhật blog
router.put("/:id", protectAdmin, blogController.updateBlog);
// Xóa blog
router.delete("/:id", protectAdmin, blogController.deleteBlog);
module.exports = router;
