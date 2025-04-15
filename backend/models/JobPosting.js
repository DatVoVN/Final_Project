const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Job posting must belong to a company"],
    },
    postedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Developer",
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
    },
    benefits: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    salaryCurrency: {
      type: String,
      default: "VND",
      trim: true,
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "filled"],
      default: "draft",
    },
    applicationDeadline: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

jobPostingSchema.index({ company: 1 });
jobPostingSchema.index({ status: 1 });
jobPostingSchema.index({ location: 1 });
jobPostingSchema.index({ jobType: 1 });
jobPostingSchema.index({ skillsRequired: 1 });

const JobPosting = mongoose.model("JobPosting", jobPostingSchema);

module.exports = JobPosting;
