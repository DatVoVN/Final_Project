const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: false,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    jobType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Freelance",
        "Remote",
      ],
      default: "Full-time",
    },

    experienceLevel: {
      type: String,
      enum: ["Intern", "Fresher", "Junior", "Mid", "Senior", "Lead"],
      required: true,
    },

    locationType: {
      type: String,
      enum: ["Onsite", "Hybrid", "Remote"],
      default: "Onsite",
    },

    remote: {
      type: Boolean,
      default: false,
    },
    // Kỹ năng yêu cầu
    languages: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },

    // Ứng viên đã nộp
    applicants: [
      {
        candidate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    postedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const JobPosting = mongoose.model("JobPosting", jobPostingSchema);
module.exports = JobPosting;
