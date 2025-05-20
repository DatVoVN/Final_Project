const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Package = require("../models/Package");
const protectEmployer = require("../middleware/protectDeveloper");

router.post("/create-checkout-session", protectEmployer, async (req, res) => {
  const { packageName } = req.body;
  const user = req.user;

  console.log("📦 Tạo checkout session cho gói:", packageName);
  console.log("👤 User:", user?.email, "ID:", user?._id);

  try {
    const selectedPackage = await Package.findOne({ name: packageName });
    console.log("💰 selectedPackage:", selectedPackage);

    if (!selectedPackage) {
      return res.status(400).json({ message: "Gói không hợp lệ" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/employer/payment-status?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/employer/payment-status?status=cancel`,
      metadata: {
        userId: user._id.toString(),
        packageName,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("🟥 Stripe checkout error:");
    console.error("Message:", err.message);
    res.status(500).json({
      message: "Lỗi tạo phiên thanh toán.",
      error: err.message,
    });
  }
});

module.exports = router;
