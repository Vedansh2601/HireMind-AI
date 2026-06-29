const axios = require("axios");
const Application = require("../models/Application");
const Job = require("../models/Job");

// Splits a string of concatenated top-level JSON objects, e.g. "{...}{...}{...}",
// into separate object strings. Tracks brace depth and ignores braces that
// appear inside quoted strings, so it's not thrown off by content like
// "summary": "uses { } in prose".
function splitJsonObjects(text) {
    const chunks = [];
    let depth = 0, start = -1, inString = false, escape = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inString) {
            if (escape) escape = false;
            else if (ch === "\\") escape = true;
            else if (ch === '"') inString = false;
            continue;
        }

        if (ch === '"') { inString = true; continue; }
        if (ch === "{") { if (depth === 0) start = i; depth++; }
        if (ch === "}") {
            depth--;
            if (depth === 0 && start !== -1) {
                chunks.push(text.slice(start, i + 1));
                start = -1;
            }
        }
    }
    return chunks;
}

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

        console.log("Raw AI response received:");
        console.log(raw);

        // 6. SAFE PARSING
        // Azure sometimes streams back several JSON objects concatenated
        // together (one per workflow stage), and any one of them can be
        // malformed (e.g. the model writes "Fifty" instead of 50) without
        // affecting the others. So instead of parsing everything as one
        // blob, split on real top-level object boundaries and parse each
        // independently — a broken stage gets skipped, valid ones still count.
        let parsed = {
            job_description: job.description,
            results: [],
            ranked_results: []
        };

        try {
            // Case 1: perfect JSON, single object
            parsed = JSON.parse(raw);

        } catch (err) {
            console.log("⚠️ AI returned multiple/broken JSON blocks, splitting...");

            const chunks = splitJsonObjects(raw);
            let recoveredAny = false;

            chunks.forEach((chunk, i) => {
                try {
                    const obj = JSON.parse(chunk);
                    if (obj.results) parsed.results = obj.results;
                    if (obj.ranked_results) {
                        parsed.ranked_results = obj.ranked_results;
                        recoveredAny = true;
                    }
                } catch (chunkErr) {
                    console.log(`❌ Chunk ${i} failed to parse, skipping it:`, chunkErr.message);
                }
            });

            if (!recoveredAny) {
                console.log("❌ Could not recover ranked_results from any chunk");
            }
        }

        // 7. SAVE TO DB
        // Merge the two stages by candidate_id: the "results" stage has
        // matched/missing skills + summary, the "ranked_results" stage has
        // the final decision/score/rank. Both are worth keeping.
        const infoByCandidate = {};
        (parsed.results || []).forEach(r => {
            infoByCandidate[r.candidate_id] = r.candidate_info || {};
        });

        for (const result of parsed.ranked_results) {
            try {
                const info = infoByCandidate[result.candidate_id] || {};

                await Application.findOneAndUpdate(
                    {
                        jobId: jobId,
                        candidateId: result.candidate_id
                    },
                    {
                        aiResult: {
                            matchScore: info.match_score,
                            matchedSkills: info.matched_skills,
                            missingSkills: info.missing_skills,
                            experienceMatch: info.experience_match,
                            summary: info.summary,
                            finalScore: result.final_score,
                            decision: result.decision,
                            rank: result.rank,
                            reason: result.reason,
                            keyStrengths: result.key_strengths,
                            keyWeaknesses: result.key_weaknesses
                        },
                        // Defaults the recruiter's decision to whatever the AI
                        // concluded, so there's nothing extra to click through —
                        // the dropdown in the UI still lets the recruiter override it.
                        recruiterDecision: result.decision
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