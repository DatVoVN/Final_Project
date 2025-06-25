const express = require("express");
const router = express.Router();

const { suggestJobsFromCV } = require("../controllers/suggestJobsFromCV");
const multer = require("multer");
const {
  extractAndEmbedJobs,
} = require("../controllers/extractAllJobInfoController");
const { extractCVInfo } = require("../controllers/extractCVInfoController");
const {
  matchJobsFromCVUpload,
} = require("../controllers/matchJobsFromCVUpload");
const {
  extractAndEmbedJobs1,
} = require("../controllers/jobForChatbotController");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// router.post("/suggest-jobs-from-cv", upload.single("cv"), suggestJobsFromCV);
router.get("/extract-info-all", extractAndEmbedJobs);
// router.post("/extract-info", upload.single("cv"), extractCVInfo);
router.post("/upload-and-match", upload.single("cv"), matchJobsFromCVUpload);
router.post("/extract-and-embed", extractAndEmbedJobs1);
module.exports = router;
