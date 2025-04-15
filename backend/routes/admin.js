const express = require("express");
const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");
const { protectAdmin } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/login", adminController.loginAdmin);
// router.get("/companies/pending", adminController.getPendingCompanies);
// router.patch("/companies/:companyId/approve", adminController.approveCompany);
// router.patch("/companies/:companyId/reject", adminController.rejectCompany);
router.get(
  "/pending-employers",
  protectAdmin,
  adminController.getPendingEmployers
);
router.patch(
  "/approve-employer/:id",
  protectAdmin,
  adminController.approveEmployer
);
router.patch(
  "/reject-employer/:id",
  protectAdmin,
  adminController.rejectEmployer
);
module.exports = router;
