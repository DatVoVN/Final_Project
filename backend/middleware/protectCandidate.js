const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

const protectCandidate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Thiếu token xác thực." });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("✅ decoded:", decoded);

    const candidate = await Candidate.findById(decoded.id);
    console.log("✅ candidate:", candidate);

    if (!candidate)
      return res.status(403).json({ message: "Không có quyền truy cập." });

    req.userId = candidate._id;
    next();
  } catch (err) {
    console.error("Lỗi xác thực ứng viên:", err);
    res.status(401).json({ message: "Token không hợp lệ." });
  }
};

module.exports = protectCandidate;
