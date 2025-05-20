// routes/stripeWebhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Package = require("../models/Package");

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
    } catch (err) {
      console.error("❌ Webhook xác thực thất bại:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const packageName = session.metadata.packageName;

      try {
        const [user, selectedPackage] = await Promise.all([
          User.findById(userId),
          Package.findOne({ name: packageName }),
        ]);

        if (!user || !selectedPackage) {
          console.warn("⚠️ Không tìm thấy user hoặc gói:", {
            userId,
            packageName,
          });
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
        console.log(
          `✅ Gói '${packageName}' đã được áp dụng cho user ${user.email}`
        );
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật user sau thanh toán:", err.message);
        return res.status(500).send("Lỗi server khi cập nhật user.");
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
