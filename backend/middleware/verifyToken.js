const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Không có token hoặc định dạng Bearer sai.");
    return res.status(401).json({ message: "Không có token!" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verify failed:", err.message);
    return res.status(403).json({ message: "Token không hợp lệ!" });
  }
};

module.exports = verifyToken;
