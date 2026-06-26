const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    resumeText: {
      type: String,
      required: true
    },

    aiResult: {
      matchScore: {
        type: Number
      },

      finalScore: {
        type: Number
      },

      decision: {
        type: String,
        enum: ["SHORTLIST", "REVIEW", "REJECT"]
      },

      rank: {
        type: Number
      },

      reason: {
        type: String
      },

      keyStrengths: {
        type: [String]
      },

      keyWeaknesses: {
        type: [String]
      }
    },

    recruiterDecision: {
      type: String,
      enum: ["SHORTLIST", "REVIEW", "REJECT", "PENDING"],
      default: "PENDING"
    },

    emailSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Application", applicationSchema);