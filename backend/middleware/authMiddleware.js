const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ status: "fail", message: "Please log in to access." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Token verify error:", error);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập chức năng này." });
    }
    next();
  };
};
