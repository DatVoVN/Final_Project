// routes/developerRoutes.js
const express = require("express");
const router = express.Router();
const {
  createJobPosting,
  getApplicantsForJob,
  getAllJobPostings,
  getEmployerJobPostings,
} = require("../controllers/developerController");
const protectEmployer = require("../middleware/protectDeveloper");
// ai cũm có thể xem các bài đăng
router.get("/jobs", getAllJobPostings);
// chỉ có nhà tuyển dụng xem được thôi
router.get("/employer/jobs", protectEmployer, getEmployerJobPostings);
// Route đăng bài tuyển dụng
router.post("/job-postings", protectEmployer, createJobPosting);
// xem ai đã ứng tuyển trong cái bài đăng đó
router.get("/job/:jobId/applicants", protectEmployer, getApplicantsForJob);

module.exports = router;
