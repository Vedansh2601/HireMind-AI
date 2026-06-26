const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN"
    },

    createdBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Job", jobSchema);