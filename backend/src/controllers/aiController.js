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

        // 2. BLOCK AI if job is still OPEN
        if (job.status !== "CLOSED") {
            return res.status(400).json({
                success: false,
                message: "Job must be CLOSED before running AI"
            });
        }

        // 3. Get all applications for this job
        const applications = await Application.find({ jobId });

        if (!applications.length) {
            return res.status(400).json({
                success: false,
                message: "No applications found for this job"
            });
        }

        // 4. Build clean AI input batch
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

        // 6. Parse AI response safely
        const jsonBlocks = raw.match(/\{[\s\S]*?\}(?=\s*\{|\s*$)/g);

        const finalOutput = {
            job_description: job.description,
            results: [],
            ranked_results: []
        };

        if (jsonBlocks) {
            jsonBlocks.forEach(block => {
                try {
                    const parsed = JSON.parse(block);

                    if (parsed.results) {
                        finalOutput.results = parsed.results;
                    }

                    if (parsed.ranked_results) {
                        finalOutput.ranked_results = parsed.ranked_results;
                    }

                } catch (err) {
                    console.log("Skipping invalid JSON block");
                }
            });
        }

        // 7. Save AI results into DB
        for (const result of finalOutput.ranked_results) {
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
                { new: true }
            );
        }

        // 8. Return response
        return res.json({
            success: true,
            data: finalOutput
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