const express = require("express");
const router = express.Router();

const {
  createApplication,
  getApplicationsByJob,
  updateRecruiterDecision
} = require("../controllers/applicationController");

const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");

// Wraps multer so its errors come back as JSON, not a crash.
const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// 👤 PUBLIC ROUTE (candidates)
// uploadResume only kicks in for multipart/form-data requests —
// plain JSON requests (e.g. curl/console testing with resumeText) pass through untouched.
router.post("/applications", uploadResume, createApplication);

// 🧑‍💼 RECRUITER ROUTES (protected)
router.get("/jobs/:jobId/applications", adminAuth, getApplicationsByJob);
router.patch("/applications/:applicationId/decision", adminAuth, updateRecruiterDecision);

module.exports = router;
