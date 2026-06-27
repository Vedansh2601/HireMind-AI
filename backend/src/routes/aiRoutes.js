const express = require("express");
const router = express.Router();

const { runWorkflow } = require("../controllers/aiController");

router.post("/jobs/:jobId/run-ai", runWorkflow);

module.exports = router;