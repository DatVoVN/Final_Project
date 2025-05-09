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
  getCompanyById,
  getCompanyReviews,
  getJobPostingById,
  getJobPostingByIdFix,
  searchJob,
  deleteJobPosting,
  reactivateJobPosting,
  deactivateJobPosting,
  updateJobPosting,
  getJobPostingByIdByDeveloper,
  searchCompany,
  handleApplicantDecision,
} = require("../controllers/developerController");
const protectEmployer = require("../middleware/protectDeveloper");
const uploadAvatar = require("../middleware/uploadAvatar");
//////////////////////// CÁI GÌ CŨNG XEM ĐƯỢC //////////////////////////////
/// Ai cũm có thể xem các bài đăng
router.get("/jobs", getAllJobPostings);
// ai cum có thể xem company
router.get("/companys", getAllCompany);
// ai cum tim kiem cong ty theo ten
router.get("/companys/search", searchCompany);
// route xem chi tiết cong ty
router.get("/companys/:companyId", getCompanyById);
// route xem review cong ty
router.get("/reviews/:companyId", getCompanyReviews);
////////////////////////////// XEM BÀI ĐĂNG //////////////////////////////////
/// Lấy thông tin bài đăng của mình
router.get("/employer/jobs", protectEmployer, getEmployerJobPostings);
/// Route đăng bài tuyển dụng
router.post("/job-postings", protectEmployer, createJobPosting);
// Xem ai đã ứng tuyển trong cái bài đăng đó
router.get("/job/:jobId/applicants", protectEmployer, getApplicantsForJob);
// Lấy job theo công ty
router.get("/jobs/company/:companyId", getJobsByCompany);
/// Lay job theo id
router.get("/jobs/jobdetail/:id", getJobPostingById);
router.get("/jobs/:id", getJobPostingByIdFix);
/// Tìm kiếm job
router.get("/searchJob", searchJob);
//////////////////////////////// THÔNG TIN ////////////////////////////////////
/// xem thong tin cua developer
router.get("/me", protectEmployer, getMyInfo);
/// cập nhât công ty
router.put(
  "/my-company",
  protectEmployer,
  uploadAvatar.single("avatarUrl"),
  updateMyCompany
);
///////////////////////////////// COMPANY ////////////////////////////////////////
// Filter tên công ty theo tên
router.get("/", getCompaniesByName);

//////////////////////////////////////////////// CRUD bai đăng//////////////////////////////////////////////////
/// Xoa bài đăng
router.delete("/jobs/:id", protectEmployer, deleteJobPosting);
/// Ẩn và hiện bài đăng
router.patch("/jobs/:id/reactivate", protectEmployer, reactivateJobPosting);
router.patch("/jobs/:id/deactivate", protectEmployer, deactivateJobPosting);
// chỉnh sửa bài đăng
router.put("/jobs/:id", protectEmployer, updateJobPosting);
// lấy thông tin bài dằn theo id
router.get("/jobs/detail/:id", getJobPostingByIdByDeveloper);
/// Chap nhạn CV hay loai CV
router.patch(
  "/jobs/:jobId/applicants/:applicantId",
  protectEmployer,
  handleApplicantDecision
);
module.exports = router;
