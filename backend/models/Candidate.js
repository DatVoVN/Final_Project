const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dateOfBirth: { type: Date },
  address: { type: String },
  avatarUrl: { type: String },
  cvUrl: { type: String },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobPosting" }],
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, default: "candidate" },
  interestedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobPosting" }],
  likedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
  /// Tạo CV
  structuredCV: {
    summary: { type: String },
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    experience: [
      {
        company: String,
        title: String,
        location: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    skills: [String],
    languages: [String],
    certifications: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        expirationDate: Date,
        credentialId: String,
        credentialUrl: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        link: String,
      },
    ],
  },
});
CandidateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Candidate", CandidateSchema);
