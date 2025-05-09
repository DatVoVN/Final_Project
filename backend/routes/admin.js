const express = require("express");
const adminController = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");
const router = express.Router();
/// Đăng nhập
router.post("/login", adminController.loginAdmin);
///Admin xem có thể duyệt tài khoản của người tuyển dụng ko
router.get(
  "/pending-employers",
  protectAdmin,
  adminController.getPendingEmployers
);
/// Admin chấp thuận tài khoản
router.patch(
  "/approve-employer/:id",
  protectAdmin,
  adminController.approveEmployer
);
/// Admin không chấp thuận
router.patch(
  "/reject-employer/:id",
  protectAdmin,
  adminController.rejectEmployer
);
/// Thống kê
router.get("/stat", adminController.getSummaryStats);
////////////////////////// CRUD //////////////////////////////
/// Xóa developer
router.delete(
  "/employers/:id",
  protectAdmin,
  adminController.deleteEmployerByAdmin
);
/// Xem tất cả developer hiện có
router.get("/employers", protectAdmin, adminController.getAllEmployers);
/// Xem tất cả candidate hiện có
router.get("/candidates", protectAdmin, adminController.getAllCandidates);
/// Xóa candidate
router.delete(
  "/candidates/:id",
  protectAdmin,
  adminController.deleteCandidateByAdmin
);
router.get("/jobs", protectAdmin, adminController.getAllJob);
module.exports = router;
