const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email."],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [
        function () {
          return this.role === "employer";
        },
        "Employer must belong to a company",
      ],
    },
    role: { type: String, enum: ["employer"], default: "employer" },
    isActive: { type: Boolean, default: true },
    isRejected: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    ////// THANH TOÁN STRIPE
    package: {
      type: String,
      default: null,
    },
    postsRemaining: {
      type: Number,
      default: 0,
    },
    packageExpires: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
//////////// CẬP NHẬP GÓI SAU KHI THANH TOÁN THÀNH CÔNG

userSchema.index({ company: 1 });
const User = mongoose.model("User", userSchema);
module.exports = User;
