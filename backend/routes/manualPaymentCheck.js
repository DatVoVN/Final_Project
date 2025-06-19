// routes/manualPaymentCheck.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PayOS = require("@payos/node");

const User = require("../models/User");
const Package = require("../models/Package");
const Receipt = require("../models/Receipt");

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

router.post("/check-stripe", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "Thiếu sessionId" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(200)
        .json({ status: session.payment_status, updated: false });
    }
    let receipt = await Receipt.findOneAndUpdate(
      { sessionId, status: "pending" },
      { status: "paid" },
      { new: true }
    );
    if (!receipt) {
      receipt = await Receipt.findOne({ sessionId });
      if (receipt && receipt.status === "paid") {
        return res.status(200).json({
          status: "paid",
          updated: false,
          alreadyPaid: true,
          message: "Đã thanh toán trước đó",
        });
      }

      return res.status(404).json({ message: "Không tìm thấy hóa đơn Stripe" });
    }
    const [user, selectedPackage] = await Promise.all([
      User.findById(receipt.userId),
      Package.findOne({ name: receipt.packageName }),
    ]);

    if (!user || !selectedPackage) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy user hoặc gói dịch vụ" });
    }
    user.postsRemaining = (user.postsRemaining || 0) + selectedPackage.posts;
    user.package = selectedPackage.name;

    const now = Date.now();
    const baseTime =
      user.packageExpires && user.packageExpires > now
        ? new Date(user.packageExpires).getTime()
        : now;

    user.packageExpires = new Date(
      baseTime + selectedPackage.duration * 86400000
    );

    await user.save();
    return res.status(200).json({ status: "paid", updated: true });
  } catch (err) {
    console.error("Stripe manual error:", err.message);
    res.status(500).json({ message: "Lỗi khi kiểm tra Stripe" });
  }
});
router.post("/check-payos", async (req, res) => {
  const { orderCode } = req.body;

  if (!orderCode) return res.status(400).json({ message: "Thiếu orderCode" });

  try {
    const info = await payOS.getPaymentLinkInformation(Number(orderCode));

    if (info.status !== "PAID") {
      return res.status(200).json({ status: info.status, updated: false });
    }

    const receipt = await Receipt.findOneAndUpdate(
      { orderCode: orderCode.toString(), status: "pending" },
      { status: "paid" }
    );

    if (!receipt)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn PayOS" });

    const [user, selectedPackage] = await Promise.all([
      User.findById(receipt.userId),
      Package.findOne({ name: receipt.packageName }),
    ]);

    if (!user || !selectedPackage)
      return res.status(404).json({ message: "Không tìm thấy user hoặc gói" });

    user.postsRemaining = (user.postsRemaining || 0) + selectedPackage.posts;
    user.package = selectedPackage.name;

    const now = Date.now();
    const baseTime =
      user.packageExpires && user.packageExpires > now
        ? new Date(user.packageExpires).getTime()
        : now;

    user.packageExpires = new Date(
      baseTime + selectedPackage.duration * 86400000
    );
    await user.save();

    return res.status(200).json({ status: "paid", updated: true });
  } catch (err) {
    console.error("PayOS manual error:", err.message);
    res.status(500).json({ message: "Lỗi khi kiểm tra PayOS" });
  }
});

module.exports = router;
