const Application = require("../models/Application");
const Candidate = require("../models/Candidate");

const createApplication = async (req, res) => {
  try {
    const { name, email, phone, jobId, resumeText } = req.body;

    // 1. Find candidate
    let candidate = await Candidate.findOne({ email });

    // 2. Auto-create if not exists
    if (!candidate) {
      candidate = await Candidate.create({
        name,
        email,
        phone
      });
    }

    // 3. Create application
    const application = await Application.create({
      candidateId: candidate._id,
      jobId,
      resumeText
    });

    res.status(201).json({
      message: "Application created successfully",
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createApplication };