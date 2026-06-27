const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");

const createApplication = async (req, res) => {
  try {
    const { name, email, phone, jobId, resumeText } = req.body;

    // 1. Validate job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // 2. BLOCK applications if job is CLOSED (IMPORTANT FIX)
    if (job.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Applications are closed for this job"
      });
    }

    // 3. Find existing candidate OR create new one
    let candidate = await Candidate.findOne({ email });

    if (!candidate) {
      candidate = await Candidate.create({
        name,
        email,
        phone
      });
    }

    // 4. Create application
    const application = await Application.create({
      candidateId: candidate._id,
      jobId,
      resumeText
    });

    return res.status(201).json({
      success: true,
      message: "Application created successfully",
      application
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createApplication
};