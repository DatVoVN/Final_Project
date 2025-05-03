const authController = require("../controllers/authController");

const router = require("express").Router();
//////////////////// DEVELOPER //////////////////////////
/// Đăng kí nhà tuyển dụng
router.post("/register/employer", authController.registerEmployer);
/// Đăng nhập nhà tuyển dụng
router.post("/login/employer", authController.loginEmployer);
//////////////////// CANDIDATE ///////////////////////////
/// Đăng kí ứng viên
router.post("/candidate/register", authController.registerCandidate);
/// Đăng nhập ứng viên
router.post("/candidate/login", authController.loginCandidate);
/// Nhận mã OTP
router.post("/candidate/verify-otp", authController.verifyOtp);
/// Gửi lại mã OTP
router.post("/candidate/resend-otp", authController.resendOtp);
/// Đăng xuất
router.post("/candidate/logout", authController.logoutCandidate);
module.exports = router;
