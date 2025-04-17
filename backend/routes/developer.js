// routes/developerRoutes.js
const express = require("express");
const router = express.Router();
const {
  createJobPosting,
  getApplicantsForJob,
  getAllJobPostings,
  getEmployerJobPostings,
  getMyInfo,
  updateMyCompany,
  getAllCompany,
  getCompaniesByName,
  getJobsByCompany,
} = require("../controllers/developerController");
const protectEmployer = require("../middleware/protectDeveloper");
// ai cũm có thể xem các bài đăng
router.get("/jobs", getAllJobPostings);
// ai cum cos the xem company
router.get("/companys", getAllCompany);
// chỉ có nhà tuyển dụng xem được thôi
router.get("/employer/jobs", protectEmployer, getEmployerJobPostings);
// Route đăng bài tuyển dụng
router.post("/job-postings", protectEmployer, createJobPosting);
// xem ai đã ứng tuyển trong cái bài đăng đó
router.get("/job/:jobId/applicants", protectEmployer, getApplicantsForJob);
// xem thong tin cua developer
router.get("/me", protectEmployer, getMyInfo);
// cập nhât công ty
router.put("/my-company", protectEmployer, updateMyCompany);
// Filter tên công ty theo tên
router.get("/", getCompaniesByName);
// Lay job theo công ty
router.get("/count/:id", getJobsByCompany);
module.exports = router;
