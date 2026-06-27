const express = require("express");
const router = express.Router();

const {
    createJob,
    closeJob,
    getOpenJobs
} = require("../controllers/jobController");

// Recruiter creates job
router.post("/jobs", createJob);

// Recruiter closes job
router.patch("/jobs/:jobId/close", closeJob);

// Candidate sees only open jobs
router.get("/jobs/open", getOpenJobs);

module.exports = router;