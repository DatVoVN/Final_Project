const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Package = require("../models/Package");
const Receipt = require("../models/Receipt");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("📩 Stripe webhook received:", event.type);
    } catch (err) {
      console.log("❌ Stripe webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const packageName = session.metadata?.packageName;

      if (!userId || !packageName) {
        console.log("⚠️ Thiếu metadata trong session.");
        return res.status(400).send("Thiếu metadata");
      }

      console.log("✅ Thanh toán thành công cho user:", userId);

      try {
        const [user, selectedPackage] = await Promise.all([
          User.findById(userId),
          Package.findOne({ name: packageName }),
        ]);

        if (!user || !selectedPackage) {
          if (!user) console.log("❌ Không tìm thấy user:", userId);
          if (!selectedPackage)
            console.log("❌ Không tìm thấy gói:", packageName);
          return res.status(404).send("Không tìm thấy user hoặc gói.");
        }

        user.postsRemaining =
          (user.postsRemaining || 0) + selectedPackage.posts;
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
        const receiptUpdate = await Receipt.findOneAndUpdate(
          { sessionId: session.id },
          { status: "paid" }
        );

        if (!receiptUpdate) {
          console.warn("⚠️ Không tìm thấy hóa đơn để cập nhật:", session.id);
        } else {
          console.log("📦 Đã cập nhật receipt:", receiptUpdate._id);
        }

        console.log("🎉 Đã cập nhật user và hóa đơn sau thanh toán Stripe.");
      } catch (err) {
        console.error("❌ Lỗi khi xử lý webhook Stripe:", err.message);
        return res.status(500).send("Lỗi xử lý webhook.");
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
