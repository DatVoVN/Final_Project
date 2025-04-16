// middlewares/protectEmployer.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protectDeveloper = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Không có quyền truy cập." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Chỉ nhà tuyển dụng mới có quyền này." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

module.exports = protectDeveloper;
