const express = require("express");
const router = express.Router();
const uploadCVMiddleware = require("../middleware/uploadCV");
const candidateController = require("../controllers/candidateController");
const verifyToken = require("../middleware/verifyToken");
const uploadAvatar = require("../middleware/uploadAvatar");
const protectCandidate = require("../middleware/protectCandidate");
const { restrictTo } = require("../middleware/authMiddleware");

/////////////////////////// THÔNG TIN ////////////////////////////////////
/// Xem thông tin cá nhân
router.get("/me", verifyToken, candidateController.getMyInfo);
/// Lấy thông và update thông tin
router.get("/:id", verifyToken, candidateController.getCandidateInfoByID);
router.put("/updateInfo", verifyToken, candidateController.updateMyInfo);
///////////////////////// CÔNG TY //////////////////////////////////////
/// Get start average review của công ty
router.get("/average-star/:id", candidateController.getCompanyWithReviews);
/////////////////////////// BÀI ĐĂNG /////////////////////////////////////
/// APPLY vào bài đăng
router.post(
  "/apply",
  verifyToken,
  protectCandidate,
  candidateController.applyToJob
);
/// Hủy apply
router.post(
  "/unapply",
  verifyToken,
  protectCandidate,
  candidateController.unapplyFromJob
);
/// Xem trạng thái apply
router.get(
  "/check-applied/:jobId",
  verifyToken,
  protectCandidate,
  candidateController.checkAppliedStatus
);
////////////////////////////////////////// CV /////////////////////////////////
/// Xóa CV
router.delete("/delete-cv", verifyToken, candidateController.deleteCV);
// Cập nhật CV
router.put(
  "/update-cv",
  verifyToken,
  uploadCVMiddleware.single("cv"),
  candidateController.updateCV
);
/// Upload CV
router.post(
  "/upload-cv/:id",
  verifyToken,
  uploadCVMiddleware.single("cv"),
  candidateController.uploadCV
);
/////////////////////////////////////////// AVATAR ///////////////////////////////
/// Cập nhật Avatar
router.post(
  "/me/avatar/:id", // Thay vì POST, sử dụng PUT hoặc PATCH để cập nhật tài nguyên
  verifyToken, // Kiểm tra token
  uploadAvatar.single("avatar"), // Xử lý file ảnh upload
  candidateController.uploadAvatar // Controller xử lý cập nhật avatar
);
/// cập nhật avatar
router.put(
  "/me/avatar", // Thay vì POST, sử dụng PUT hoặc PATCH để cập nhật tài nguyên
  verifyToken, // Kiểm tra token
  uploadAvatar.single("avatar"), // Xử lý file ảnh upload
  candidateController.updateMyAvatar // Controller xử lý cập nhật avatar
);
//////////////////////////////// Review /////////////////////////////////////////////
/// Đăng review công ty
router.post(
  "/:companyId",
  verifyToken,
  protectCandidate,
  restrictTo("candidate"),
  candidateController.createOrUpdateReview
);
// update review công ty
router.put(
  "/:companyId",
  verifyToken,
  protectCandidate,
  restrictTo("candidate"),
  candidateController.updateReview
);
// yeu thich công việc
router.post(
  "/interested/:jobId",
  protectCandidate,
  candidateController.markJobAsInterested
);
router.delete(
  "/interested/:jobId",
  protectCandidate,
  candidateController.unmarkJobAsInterested
);
router.get(
  "/interested/favorites",
  protectCandidate,
  candidateController.getInterestedJobs
);
router.get(
  "/jobs/:jobId/interested-status",
  protectCandidate,
  candidateController.checkIfJobIsInterested
);
//// yeu thich cong ty
router.post(
  "/favorite-company/:companyId",
  protectCandidate,
  candidateController.addCompanyToFavorites
);
router.delete(
  "/favorite-company/:companyId",
  protectCandidate,
  candidateController.removeCompanyFromFavorites
);
router.get(
  "/favorite-company/favorites",
  protectCandidate,
  candidateController.getLikedCompanies
);
router.get(
  "/companies/:companyId/liked-status",
  protectCandidate,
  candidateController.checkIfCompanyIsLiked
);
module.exports = router;
