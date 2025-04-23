// models/Company.js
const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: { type: String },
    city: { type: String },
    email: { type: String },
    taxCode: { type: String, required: true, unique: true },
    description: { type: String },
    overview: { type: String },

    avatarUrl: {
      type: String,
      default: "",
    },

    // Trường mới
    companySize: {
      type: Number,
      default: 0,
    },
    overtimePolicy: {
      type: String,
      default: "",
    },
    workingDays: {
      type: {
        from: { type: String },
        to: { type: String },
      },
      default: { from: "Monday", to: "Friday" },
    },
    languages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Company", CompanySchema);
