const Candidate = require("../models/Candidate");

const createCandidate = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    let candidate = await Candidate.findOne({ email });

    if (!candidate) {
      candidate = await Candidate.create({
        name,
        email,
        phone
      });
    }

    res.status(201).json({
      message: "Candidate saved",
      candidate
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCandidate };