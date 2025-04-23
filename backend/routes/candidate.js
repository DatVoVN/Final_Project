const express = require("express");
const router = express.Router();
const uploadCVMiddleware = require("../middleware/uploadCV");
const candidateController = require("../controllers/candidateController");
const verifyToken = require("../middleware/verifyToken");
const uploadAvatar = require("../middleware/uploadAvatar");
const protectCandidate = require("../middleware/protectCandidate");
const { restrictTo } = require("../middleware/authMiddleware");
// Route upload CV
// Xdm thông tin cá nhân
router.get("/me", verifyToken, candidateController.getMyInfo);
// Get start average review
router.get("/average-star/:id", candidateController.getCompanyWithReviews);
// APPLY vào bài đăng
router.post(
  "/apply",
  verifyToken,
  protectCandidate,
  candidateController.applyToJob
);
// Hủy apply
router.post(
  "/unapply",
  verifyToken,
  protectCandidate,
  candidateController.unapplyFromJob
);
// Lấy thông và update thông tin
router.get("/:id", verifyToken, candidateController.getCandidateInfoByID);
router.put("/updateInfo", verifyToken, candidateController.updateMyInfo);
// Xóa CV
router.delete("/delete-cv", verifyToken, candidateController.deleteCV);
// Cập nhật Avatar
router.put(
  "/me/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  candidateController.updateMyAvatar
);
// Uplaod CV
router.post(
  "/upload-cv/:id",
  verifyToken,
  uploadCVMiddleware.single("cv"),
  candidateController.uploadCV
);
// Cập nhật CV
router.put(
  "/update-cv",
  verifyToken,
  uploadCVMiddleware.single("cv"),
  candidateController.updateCV
);
// Review
router.post(
  "/:companyId",
  verifyToken,
  protectCandidate,
  restrictTo("candidate"),
  candidateController.createOrUpdateReview
);

// update review
router.put(
  "/:companyId",
  verifyToken,
  protectCandidate,
  restrictTo("candidate"),
  candidateController.updateReview
);
router.get(
  "/check-applied/:jobId",
  verifyToken,
  protectCandidate,
  candidateController.checkAppliedStatus
);
module.exports = router;
