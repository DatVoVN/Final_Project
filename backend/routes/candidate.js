const express = require("express");
const router = express.Router();
const uploadCVMiddleware = require("../middleware/uploadCV");
const candidateController = require("../controllers/candidateController");
const verifyToken = require("../middleware/verifyToken");
const uploadAvatar = require("../middleware/uploadAvatar");
// Route upload CV

router.get("/me", verifyToken, candidateController.getMyInfo);
router.get("/:id", verifyToken, candidateController.getCandidateInfoByID);
router.put("/updateInfo", verifyToken, candidateController.updateMyInfo);
router.delete("/delete-cv", verifyToken, candidateController.deleteCV);
router.put(
  "/me/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  candidateController.updateMyAvatar
);
router.post(
  "/upload-cv/:id",
  verifyToken,
  uploadCVMiddleware.single("cv"),
  candidateController.uploadCV
);
router.put(
  "/update-cv",
  verifyToken,
  uploadCVMiddleware.single("cv"),
  candidateController.updateCV
);
module.exports = router;
