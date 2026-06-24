const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Resume Data
    resumeText: {
      type: String,
    },

    skills: {
      type: [String],
      default: [],
    },

    experienceYears: {
      type: String,
    },

    education: {
      type: String,
    },

    workExperience: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
    },

    // AI OUTPUT (Agent 3 will fill this later)
    aiEvaluation: {
      matchScore: {
        type: Number,
        default: 0,
      },

      decision: {
        type: String,
        enum: ["SHORTLIST", "REVIEW", "REJECT", "PENDING"],
        default: "PENDING",
      },

      reason: {
        type: String,
        default: "",
      },
    },

    // Recruiter override (important for your dashboard)
    recruiterDecision: {
      type: String,
      enum: ["SHORTLIST", "REJECT", "PENDING"],
      default: "PENDING",
    },

    isEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

module.exports = mongoose.model("Candidate", CandidateSchema);