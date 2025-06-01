const express = require("express");
const router = express.Router();
const PayOS = require("@payos/node");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const protectEmployer = require("../middleware/protectDeveloper");
const Package = require("../models/Package");
const User = require("../models/User");
const Receipt = require("../models/Receipt");

router.post("/create-checkout-session", protectEmployer, async (req, res) => {
  const { packageName, method } = req.body;
  const user = req.user;

  try {
    const selectedPackage = await Package.findOne({ name: packageName });
    if (!selectedPackage) {
      return res.status(400).json({ message: "Gói không hợp lệ" });
    }

    const orderCode = Date.now();

    if (method === "payos") {
      const payOS = new PayOS(
        process.env.PAYOS_CLIENT_ID,
        process.env.PAYOS_API_KEY,
        process.env.PAYOS_CHECKSUM_KEY
      );

      const payosData = {
        orderCode,
        amount: selectedPackage.priceVND,
        description: `Gói ${packageName}`.slice(0, 25),
        returnUrl: `${process.env.CLIENT_URL}/employer/payment-status?status=PAID&orderCode=${orderCode}`,
        cancelUrl: `${process.env.CLIENT_URL}/employer/payment-status?status=cancel`,
        items: [
          {
            name: selectedPackage.name,
            quantity: 1,
            price: selectedPackage.priceVND,
          },
        ],
        buyerName: user.fullName || "No Name",
        buyerEmail: user.email || "noemail@example.com",
        buyerPhone: user.phoneNumber || "0000000000",
        extraData: JSON.stringify({
          userId: user._id,
          packageName: packageName,
        }),
      };

      const response = await payOS.createPaymentLink(payosData);

      // Ghi lại hóa đơn
      await Receipt.create({
        userId: user._id,
        packageName,
        method: "payos",
        orderCode: orderCode.toString(),
        amount: selectedPackage.priceVND,
        status: "pending",
      });

      return res.json({ payUrl: response.checkoutUrl });
    }

    // STRIPE
    else if (method === "stripe") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "vnd",
              product_data: {
                name: `Gói ${packageName}`,
              },
              unit_amount: selectedPackage.priceVND,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/employer/payment-status?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/employer/payment-status?status=cancel`,
        metadata: {
          userId: user._id.toString(),
          packageName: packageName,
        },
      });

      await Receipt.create({
        userId: user._id,
        packageName,
        method: "stripe",
        sessionId: session.id,
        amount: selectedPackage.priceVND,
        status: "pending",
      });

      return res.json({ url: session.url });
    }

    return res
      .status(400)
      .json({ message: "Phương thức thanh toán không hợp lệ." });
  } catch (error) {
    console.error("❌ Lỗi tạo phiên thanh toán:", error.message);
    res.status(500).json({
      message: "Không thể tạo phiên thanh toán.",
      error: error.message,
    });
  }
});

module.exports = router;
