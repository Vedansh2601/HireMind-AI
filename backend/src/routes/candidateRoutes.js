const express = require("express");
const router = express.Router();

const { createCandidate } = require("../controllers/candidateController");

// POST /api/candidate
router.post("/candidate", createCandidate);

module.exports = router;