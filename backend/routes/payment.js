const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");
const protectEmployer = require("../middleware/protectDeveloper");

router.get("/my-receipts", protectEmployer, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const method = req.query.method;
    const filter = { userId };
    if (method && ["stripe", "payos"].includes(method.toLowerCase())) {
      filter.method = method.toLowerCase();
    }

    const [receipts, total] = await Promise.all([
      Receipt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Receipt.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      receipts,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy hóa đơn:", err.message);
    res.status(500).json({ message: "Lỗi server khi lấy hóa đơn" });
  }
});

module.exports = router;
