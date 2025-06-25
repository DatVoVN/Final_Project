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
    vacancies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
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
    languages: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
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
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "hired"],
          default: "pending",
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],
    likedByCandidates: [
      {
        candidate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    structuredInfo: {
      type: Object,
      default: {},
    },
    jobEmbedding: {
      type: [Number],
      default: [],
    },
    chatbotContext: {
      type: String,
      default: "",
    },
  },

  { timestamps: true }
);

const JobPosting =
  mongoose.models.JobPosting || mongoose.model("JobPosting", jobPostingSchema);
module.exports = JobPosting;
