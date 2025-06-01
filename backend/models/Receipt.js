const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  packageName: { type: String, required: true },
  method: { type: String, enum: ["payos", "stripe"], required: true },
  orderCode: { type: String }, // dùng cho PayOS
  sessionId: { type: String }, // dùng cho Stripe
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Receipt", receiptSchema);
