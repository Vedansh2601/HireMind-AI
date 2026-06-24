const Candidate = require("../models/Candidate");

// Create new candidate (basic version first)
const createCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      resumeText,
      skills,
      experienceYears,
      education,
      workExperience,
      projects,
    } = req.body;

    // Create candidate in DB
    const candidate = await Candidate.create({
      name,
      email,
      phone,
      resumeText,
      skills,
      experienceYears,
      education,
      workExperience,
      projects,
    });

    return res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: candidate,
    });
  } catch (error) {
    console.error("Error creating candidate:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating candidate",
    });
  }
};

module.exports = {
  createCandidate,
};