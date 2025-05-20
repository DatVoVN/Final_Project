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
router.get("/employers", adminController.getAllEmployers);
/// Xem tất cả candidate hiện có
router.get("/candidates", adminController.getAllCandidates);
/// Xóa candidate
router.delete(
  "/candidates/:id",
  protectAdmin,
  adminController.deleteCandidateByAdmin
);
router.get("/jobs", adminController.getAllJob);
router.delete("/jobs/:id", protectAdmin, adminController.deleteJobByAdmin);
//////////// quản lý package/////////////
router.get("/package", adminController.getPackage);
router.get("/package/:name", adminController.getPackageByName);
router.post("/package", protectAdmin, adminController.createPackage);
router.put("/package/:id", protectAdmin, adminController.updatePackage);
router.delete("/package/:id", protectAdmin, adminController.deletePackage);
module.exports = router;
