const axios = require("axios");
const Application = require("../models/Application");
const Job = require("../models/Job");

const runWorkflow = async (req, res) => {
    try {
        console.log("🚀 AI batch request received");

        const jobId = req.params.jobId;

        // 1. Get job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // 2. BLOCK IF JOB NOT CLOSED
        if (job.status !== "CLOSED") {
            return res.status(400).json({
                success: false,
                message: "Job must be CLOSED before running AI"
            });
        }

        // 3. Get applications
        const applications = await Application.find({ jobId });

        if (!applications.length) {
            return res.status(400).json({
                success: false,
                message: "No applications found for this job"
            });
        }

        // 4. Build AI payload
        const payload = {
            job_description: job.description,
            candidates: applications.map(app => ({
                candidate_id: app.candidateId,
                resumeText: app.resumeText
            }))
        };

        // 5. Call AI service
        const response = await axios.post(
            process.env.PYTHON_AI_URL,
            payload
        );

        const raw = response.data.result;

        console.log("Raw AI response received");

        // 6. SAFE PARSING (FIXED)
        let parsed = {
            job_description: job.description,
            results: [],
            ranked_results: []
        };

        try {
            // Case 1: perfect JSON
            parsed = JSON.parse(raw);

        } catch (err) {
            console.log("⚠️ AI returned broken JSON, fixing...");

            try {
                // Case 2: multiple JSON objects stuck together
                const fixed = `[${raw.replace(/\}\s*\{/g, "},{")}]`;
                const arr = JSON.parse(fixed);

                arr.forEach(obj => {
                    if (obj.results) parsed.results = obj.results;
                    if (obj.ranked_results) parsed.ranked_results = obj.ranked_results;
                });

            } catch (e) {
                console.log("❌ Failed to parse AI response completely");
            }
        }

        // 7. SAVE TO DB
        for (const result of parsed.ranked_results) {
            try {
                await Application.findOneAndUpdate(
                    {
                        jobId: jobId,
                        candidateId: result.candidate_id
                    },
                    {
                        aiResult: {
                            finalScore: result.final_score,
                            decision: result.decision,
                            rank: result.rank,
                            reason: result.reason,
                            keyStrengths: result.key_strengths,
                            keyWeaknesses: result.key_weaknesses
                        }
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );
            } catch (err) {
                console.log("DB update error:", err.message);
            }
        }

        // 8. RESPONSE
        return res.json({
            success: true,
            data: parsed
        });

    } catch (error) {
        console.error("AI Controller Error:", error.message);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { runWorkflow };