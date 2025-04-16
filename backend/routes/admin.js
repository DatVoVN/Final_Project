const express = require("express");
const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");
const { protectAdmin } = require("../middleware/authMiddleware");
const router = express.Router();
// Đăng nhập
router.post("/login", adminController.loginAdmin);
// Admin xem có thể duyệt tài khoản của người tuyển dụng ko
router.get(
  "/pending-employers",
  protectAdmin,
  adminController.getPendingEmployers
);
// Admin chấp thuận tài khoản
router.patch(
  "/approve-employer/:id",
  protectAdmin,
  adminController.approveEmployer
);
// Admin không chấp thuận
router.patch(
  "/reject-employer/:id",
  protectAdmin,
  adminController.rejectEmployer
);
module.exports = router;
