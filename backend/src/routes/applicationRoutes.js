const express = require("express");
const router = express.Router();

const {
  createApplication,
  getApplicationsByJob,
  updateRecruiterDecision
} = require("../controllers/applicationController");

const adminAuth = require("../middleware/adminAuth");

// 👤 PUBLIC ROUTE (candidates)
router.post("/applications", createApplication);

// 🧑‍💼 RECRUITER ROUTES (protected)
router.get("/jobs/:jobId/applications", adminAuth, getApplicationsByJob);
router.patch("/applications/:applicationId/decision", adminAuth, updateRecruiterDecision);

module.exports = router;
