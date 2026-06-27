const express = require("express");
const router = express.Router();

const {
    createJob,
    closeJob,
    getOpenJobs,
    getAllJobs
} = require("../controllers/jobController");

const { runWorkflow } = require("../controllers/aiController"); 

const adminAuth = require("../middleware/adminAuth");

// 👤 PUBLIC ROUTE (candidates)
router.get("/jobs/open", getOpenJobs);

// 🧑‍💼 RECRUITER ROUTES (protected)
router.post("/jobs", adminAuth, createJob);
router.patch("/jobs/:jobId/close", adminAuth, closeJob);

router.get("/jobs", adminAuth, getAllJobs);

router.post("/jobs/:jobId/run-ai", adminAuth, runWorkflow);

module.exports = router;