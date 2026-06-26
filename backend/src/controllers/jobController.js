const Job = require("../models/Job");


// Create a new job
const createJob = async (req, res) => {
  try {

    const { title, description, createdBy } = req.body;

    const job = await Job.create({
      title,
      description,
      createdBy
    });

    res.status(201).json({
      message: "Job created successfully",
      job
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


module.exports = {
  createJob
};