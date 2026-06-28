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

// GET ALL APPLICATIONS FOR A JOB (with candidate info + AI result)
// Used by the recruiter to actually see what run-ai produced.
const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const applications = await Application.find({ jobId })
      .populate("candidateId", "name email phone")
      .sort({ "aiResult.rank": 1, createdAt: -1 });

    return res.json({
      success: true,
      job: { _id: job._id, title: job.title, status: job.status },
      applications
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// RECRUITER OVERRIDE — lets the recruiter accept/override the AI decision
const updateRecruiterDecision = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { recruiterDecision } = req.body;

    const allowed = ["SHORTLIST", "REVIEW", "REJECT", "PENDING"];
    if (!allowed.includes(recruiterDecision)) {
      return res.status(400).json({
        success: false,
        message: `recruiterDecision must be one of: ${allowed.join(", ")}`
      });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { recruiterDecision },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    return res.json({
      success: true,
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
  createApplication,
  getApplicationsByJob,
  updateRecruiterDecision
};