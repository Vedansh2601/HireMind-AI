const express = require("express");
const router = express.Router();

const { createCandidate } = require("../controllers/candidateController");

router.post("/candidates", createCandidate);

module.exports = router;