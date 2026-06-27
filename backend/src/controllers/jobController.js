const Job = require("../models/Job");

// CREATE JOB
const createJob = async (req, res) => {
    try {
        const { title, description, createdBy } = req.body;

        const job = await Job.create({
            title,
            description,
            createdBy
        });

        res.status(201).json({
            message: "Job created successfully",
            job
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// CLOSE JOB
const closeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        job.status = "CLOSED";
        await job.save();

        res.json({
            success: true,
            message: "Job closed successfully",
            job
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const getOpenJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: "OPEN" });

        res.json({
            success: true,
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createJob,
    closeJob , 
    getOpenJobs , 
    getAllJobs
};