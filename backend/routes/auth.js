const authController = require("../controllers/authController");

const router = require("express").Router();
// DEVELOPER
router.post("/register/employer", authController.registerEmployer);
router.post("/login/employer", authController.loginEmployer);
//CANDIDATE
router.post("/candidate/register", authController.registerCandidate);
router.post("/candidate/login", authController.loginCandidate);
router.post("/candidate/verify-otp", authController.verifyOtp);
router.post("/candidate/resend-otp", authController.resendOtp);
router.post("/candidate/logout", authController.logoutCandidate);
module.exports = router;
