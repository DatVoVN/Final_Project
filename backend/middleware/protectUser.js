const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");
const User = require("../models/User");

const protectUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Thiếu token xác thực." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Thử tìm trong Candidate trước
    let user = await Candidate.findById(decoded.id);
    if (user) {
      req.user = user;
      req.userRole = "Candidate";
      req.userId = user._id;
      return next();
    }

    // Nếu không phải candidate thì thử tìm trong User (employer)
    user = await User.findById(decoded.userId);
    if (user && user.role === "employer") {
      req.user = user;
      req.userRole = "User";
      req.userId = user._id;
      return next();
    }

    // Nếu không tìm thấy user hợp lệ
    return res.status(403).json({ message: "Không có quyền truy cập." });
  } catch (err) {
    console.error("Lỗi xác thực:", err);
    return res.status(401).json({ message: "Token không hợp lệ." });
  }
};

module.exports = protectUser;
