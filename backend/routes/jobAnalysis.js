const express = require("express");
const router = express.Router();
const jobAnalysisController = require("../controllers/jobAnalysisController");

// Route chạy phân tích tất cả jobs
router.get("/extract-all", jobAnalysisController.extractAllJobsInfo);

module.exports = router;
