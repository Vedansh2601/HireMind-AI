"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // AUTH STATE (IMPORTANT)
    const [isAuth, setIsAuth] = useState(false);
    const [keyInput, setKeyInput] = useState("");

    const adminKey = "secret123";
    const API = "http://localhost:5000/api";

    // LOAD JOBS
    const loadJobs = async () => {
        const res = await fetch(`${API}/jobs`, {
            headers: {
                "x-admin-key": adminKey
            }
        });

        const data = await res.json();
        setJobs(data.jobs || []);
    };

    useEffect(() => {
        if (isAuth) {
            loadJobs();
        }
    }, [isAuth]);

    // CREATE JOB
    const createJob = async () => {
        await fetch(`${API}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminKey
            },
            body: JSON.stringify({
                title,
                description,
                createdBy: "admin"
            })
        });

        setTitle("");
        setDescription("");
        loadJobs();
    };

    // CLOSE JOB
    const closeJob = async (id: string) => {
        await fetch(`${API}/jobs/${id}/close`, {
            method: "PATCH",
            headers: {
                "x-admin-key": adminKey
            }
        });

        loadJobs();
    };

    // RUN AI
    const runAI = async (id: string) => {
        const res = await fetch(`${API}/jobs/${id}/run-ai`, {
            method: "POST",
            headers: {
                "x-admin-key": adminKey
            }
        });

        const data = await res.json();
        console.log("AI RESULT:", data);
    };

    // 🔐 LOGIN SCREEN (BEFORE ACCESS)
    if (!isAuth) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Recruiter Login</h2>

                <input
                    placeholder="Enter Admin Key"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                />

                <button
                    onClick={() => {
                        if (keyInput === adminKey) {
                            setIsAuth(true);
                        } else {
                            alert("Wrong admin key");
                        }
                    }}
                >
                    Login
                </button>
            </div>
        );
    }

    // 🧑‍💼 DASHBOARD UI
    return (
        <div style={{ padding: 20 }}>
            <h1>Recruiter Dashboard</h1>

            {/* CREATE JOB */}
            <div>
                <input
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    placeholder="Job Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <button onClick={createJob}>Create Job</button>
            </div>

            <hr />

            {/* JOB LIST */}
            <h2>Jobs</h2>

            {jobs.map((job) => (
                <div
                    key={job._id}
                    style={{
                        border: "1px solid black",
                        margin: 10,
                        padding: 10
                    }}
                >
                    <h3>{job.title}</h3>
                    <p>{job.description}</p>
                    <p>Status: {job.status}</p>

                    <button onClick={() => closeJob(job._id)}>
                        Close Job
                    </button>

                    <button onClick={() => runAI(job._id)}>
                        Run AI
                    </button>
                </div>
            ))}
        </div>
    );
}