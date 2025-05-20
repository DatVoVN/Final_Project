const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    description: { type: String },
    priceId: { type: String, required: true },
    posts: { type: Number, required: true },
    priceVND: { type: Number, required: true },
    duration: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
