"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────
interface Job {
  _id: string;
  title: string;
  description: string;
  status: "OPEN" | "CLOSED";
  department?: string;
  skills?: string;
  experience?: string;
  createdBy?: string;
  createdAt?: string;
}

interface AiResult {
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  experienceMatch?: string;
  summary?: string;
  finalScore?: number;
  decision?: "SHORTLIST" | "REVIEW" | "REJECT";
  rank?: number;
  reason?: string;
  keyStrengths?: string[];
  keyWeaknesses?: string[];
}

interface ApplicationRow {
  _id: string;
  candidateId?: { name?: string; email?: string; phone?: string };
  resumeText: string;
  aiResult?: AiResult;
  recruiterDecision?: "SHORTLIST" | "REVIEW" | "REJECT" | "PENDING";
}

type Page = "dashboard" | "jobs" | "create" | "detail";

// ── Constants ────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";

// ── Helpers ──────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function decisionColors(decision?: string) {
  if (decision === "SHORTLIST") return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" };
  if (decision === "REJECT") return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
  if (decision === "REVIEW") return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
  return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
}

// ── Sub-components ───────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "danger" }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "#fff",
        border: `1px solid ${type === "danger" ? "#f87171" : "#e5e7eb"}`,
        borderRadius: 8,
        padding: "10px 16px",
        fontSize: 13,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 9999,
        color: "#111",
      }}
    >
      {message}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = circ * (Math.min(Math.max(score, 0), 100) / 100);
  const color = scoreColor(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />
        <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="500" fill="#111">
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 9, color: "#9ca3af" }}>score</span>
    </div>
  );
}

function SkillTag({ label, matched }: { label: string; matched: boolean }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 7px",
        borderRadius: 10,
        background: matched ? "#d1fae5" : "#fee2e2",
        color: matched ? "#065f46" : "#991b1b",
        border: `1px solid ${matched ? "#6ee7b7" : "#fca5a5"}`,
      }}
    >
      {matched ? "✓" : "✕"} {label}
    </span>
  );
}

function CandidateCard({ app }: { app: ApplicationRow }) {
  const ai = app.aiResult;
  const score = ai?.finalScore ?? ai?.matchScore ?? 0;
  const color = scoreColor(score);
  const decision = app.recruiterDecision !== "PENDING" ? app.recruiterDecision : ai?.decision;
  const dc = decisionColors(decision);
  const name = app.candidateId?.name || `Candidate …${app._id.slice(-6)}`;

  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "1rem 1.25rem",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
            {ai?.rank && (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#9ca3af",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                #{ai.rank}
              </span>
            )}
            {name}
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "3px 8px",
                borderRadius: 10,
                background: dc.bg,
                color: dc.text,
                border: `1px solid ${dc.border}`,
              }}
            >
              {decision || "PENDING"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            {app.candidateId?.email}
          </div>
        </div>
        <ScoreRing score={score} />
      </div>

      <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 2, transition: "width .4s" }} />
      </div>

      {ai?.experienceMatch && (
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>{ai.experienceMatch}</div>
      )}

      {(ai?.matchedSkills?.length || ai?.missingSkills?.length) ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {(ai?.matchedSkills || []).map((s) => <SkillTag key={`m-${s}`} label={s} matched={true} />)}
          {(ai?.missingSkills || []).map((s) => <SkillTag key={`x-${s}`} label={s} matched={false} />)}
        </div>
      ) : null}

      {ai?.summary && (
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 8 }}>{ai.summary}</p>
      )}

      {ai?.reason && (
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 8 }}>
          <b>AI reasoning:</b> {ai.reason}
        </p>
      )}

      <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, marginBottom: 8 }}>
        <i>Resume: {app.resumeText}</i>
      </p>

      {!ai && <p style={{ fontSize: 12, color: "#9ca3af" }}>AI has not screened this candidate yet.</p>}
    </div>
  );
}

function JobCard({
  job,
  onClick,
  onClose,
}: {
  job: Job;
  onClick: () => void;
  onClose?: (e: React.MouseEvent) => void;
}) {
  const isOpen = job.status === "OPEN";

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "1.25rem",
        cursor: "pointer",
        transition: "border-color .15s, transform .15s",
        opacity: isOpen ? 1 : 0.75,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#6366f1";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          fontWeight: 500,
          padding: "3px 8px",
          borderRadius: 10,
          marginBottom: 10,
          background: isOpen ? "#d1fae5" : "#f3f4f6",
          color: isOpen ? "#065f46" : "#9ca3af",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
        {isOpen ? "Open" : "Closed"}
      </span>

      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{job.title}</div>
      <p
        style={{
          fontSize: 12,
          color: "#6b7280",
          lineHeight: 1.5,
          marginBottom: 12,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {job.description}
      </p>

      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9ca3af" }}>
        {job.department && <span>🏢 {job.department}</span>}
        {job.experience && <span>🕐 {job.experience}</span>}
      </div>

      {isOpen && onClose && (
        <div
          style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClick} style={btnStyle}>View</button>
          <button
            onClick={onClose}
            style={{ ...btnStyle, background: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" }}
          >
            Close job
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────
const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btnStyle,
  background: "#4f46e5",
  color: "#fff",
  borderColor: "transparent",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#111",
  fontSize: 13,
  fontFamily: "inherit",
  width: "100%",
};

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      <label style={{ fontSize: 12, color: "#6b7280" }}>{label}</label>
      {children}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobFilter, setJobFilter] = useState<"all" | "OPEN" | "CLOSED">("all");

  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCount, setAiCount] = useState(0);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "danger" } | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newExp, setNewExp] = useState("");

  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem("recruiterToken");
    if (saved) setToken(saved);
  }, []);

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  // ── Auth ─────────────────────────────────────────────────────────────
  const login = async () => {
    setLoginError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: keyInput }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("recruiterToken", data.token);
        setToken(data.token);
        setKeyInput("");
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch {
      setLoginError("Could not reach the server — is the backend running?");
    }
  };

  const logout = () => {
    localStorage.removeItem("recruiterToken");
    setToken(null);
    setJobs([]);
    setPage("dashboard");
  };

  // ── Jobs ─────────────────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/jobs`, { headers: authHeaders() });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      showToast("Failed to load jobs — is the server running?", "danger");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { if (token) loadJobs(); }, [token, loadJobs]);

  const createJob = async () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast("Title and description are required", "danger");
      return;
    }
    try {
      await fetch(`${API}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          department: newDept.trim(),
          skills: newSkills.trim(),
          experience: newExp.trim(),
          createdBy: "admin",
        }),
      });
      setNewTitle(""); setNewDesc(""); setNewDept(""); setNewSkills(""); setNewExp("");
      await loadJobs();
      showToast("Job posted");
      setPage("jobs");
    } catch {
      showToast("Failed to create job", "danger");
    }
  };

  const closeJob = async (id: string) => {
    try {
      await fetch(`${API}/jobs/${id}/close`, { method: "PATCH", headers: authHeaders() });
      await loadJobs();
      if (selectedJob?._id === id) setSelectedJob((prev) => (prev ? { ...prev, status: "CLOSED" } : null));
      showToast("Job closed");
    } catch {
      showToast("Failed to close job", "danger");
    }
  };

  // ── Applications + AI ────────────────────────────────────────────────
  // Pulls from the DB-backed endpoint — i.e. whatever was last saved by run-ai,
  // not a one-off response that disappears if you navigate away.
  const loadApplications = async (jobId: string) => {
    const res = await fetch(`${API}/jobs/${jobId}/applications`, { headers: authHeaders() });
    const data = await res.json();
    setApplications(data.applications || []);
  };

  const runAI = async (jobId: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/jobs/${jobId}/run-ai`, { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || data.error || "AI screening failed", "danger");
      } else {
        setAiCount((c) => c + 1);
        showToast("AI screening complete");
      }
      // Always reload from the DB after a run, since that's the source of truth
      await loadApplications(jobId);
    } catch {
      showToast("AI screening failed — is the Python service running?", "danger");
    } finally {
      setAiLoading(false);
    }
  };

  const setDecision = async (applicationId: string, recruiterDecision: string) => {
    try {
      await fetch(`${API}/applications/${applicationId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ recruiterDecision }),
      });
      setApplications((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, recruiterDecision: recruiterDecision as any } : a))
      );
    } catch {
      showToast("Failed to save decision", "danger");
    }
  };

  // ── Auth screen ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f3f4f6" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "2rem", width: 360 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>
              💼
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>TalentOS</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Recruiter Portal</div>
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.5rem" }}>This portal is for authorized recruiters only.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Admin key</label>
            <input
              type="password"
              placeholder="Enter your admin key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") login(); }}
              style={inputStyle}
            />
          </div>

          <button onClick={login} style={{ ...btnPrimary, width: "100%", justifyContent: "center" }}>
            Sign in
          </button>

          {loginError && <p style={{ color: "#991b1b", fontSize: 12, marginTop: 10 }}>{loginError}</p>}
        </div>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    );
  }

  const openJobs = jobs.filter((j) => j.status === "OPEN");
  const closedJobs = jobs.filter((j) => j.status === "CLOSED");
  const filteredJobs = jobFilter === "all" ? jobs : jobs.filter((j) => j.status === jobFilter);

  const navItem = (label: string, icon: string, target: Page) => (
    <div
      onClick={() => { setPage(target); setSelectedJob(null); setApplications([]); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 13,
        marginBottom: 2,
        background: page === target ? "#eef2ff" : "transparent",
        color: page === target ? "#4f46e5" : "#6b7280",
        fontWeight: page === target ? 500 : 400,
      }}
    >
      <span>{icon}</span>
      {label}
      {target === "jobs" && openJobs.length > 0 && (
        <span style={{ marginLeft: "auto", background: "#4f46e5", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 10 }}>
          {openJobs.length}
        </span>
      )}
    </div>
  );

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setApplications([]);
    setPage("detail");
    loadApplications(job._id);
  };

  // ── Dashboard page ───────────────────────────────────────────────────
  const renderDashboard = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Open jobs", val: openJobs.length, sub: "Active listings" },
          { label: "Closed jobs", val: closedJobs.length, sub: "No longer accepting" },
          { label: "Total jobs", val: jobs.length, sub: "All time" },
          { label: "AI screenings", val: aiCount, sub: "This session" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#f9fafb", borderRadius: 8, padding: "1rem" }}>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Open listings</span>
        <button onClick={() => setPage("create")} style={btnPrimary}>＋ Post a job</button>
      </div>

      {openJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💼</div>
          <p>No open jobs. Post one to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {openJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => openJobDetail(job)}
              onClose={(e) => { e.stopPropagation(); closeJob(job._id); }}
            />
          ))}
        </div>
      )}
    </>
  );

  // ── All jobs page ────────────────────────────────────────────────────
  const renderJobs = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>All jobs</span>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "OPEN", "CLOSED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setJobFilter(f)}
              style={{
                ...btnStyle,
                fontSize: 12,
                padding: "5px 10px",
                borderColor: jobFilter === f ? "#6366f1" : "#d1d5db",
                color: jobFilter === f ? "#4f46e5" : "#111",
              }}
            >
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>No jobs match this filter.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => openJobDetail(job)}
              onClose={(e) => { e.stopPropagation(); closeJob(job._id); }}
            />
          ))}
        </div>
      )}
    </>
  );

  // ── Create job page ──────────────────────────────────────────────────
  const renderCreate = () => (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem" }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: "1rem" }}>✏️ Post a new job</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="Job title">
          <input placeholder="e.g. Senior Backend Engineer" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Department">
          <input placeholder="e.g. Engineering" value={newDept} onChange={(e) => setNewDept(e.target.value)} style={inputStyle} />
        </Field>
      </div>

      <Field label="Description" style={{ marginBottom: 12 }}>
        <textarea
          placeholder="Describe the role, responsibilities, and requirements..."
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Field label="Required skills (comma-separated)">
          <input placeholder="React, Node.js, TypeScript" value={newSkills} onChange={(e) => setNewSkills(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Experience required">
          <input placeholder="e.g. 4+ years" value={newExp} onChange={(e) => setNewExp(e.target.value)} style={inputStyle} />
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={() => { setNewTitle(""); setNewDesc(""); setNewDept(""); setNewSkills(""); setNewExp(""); }}
          style={btnStyle}
        >
          Clear
        </button>
        <button onClick={createJob} style={btnPrimary}>→ Post job</button>
      </div>
    </div>
  );

  // ── Job detail page ──────────────────────────────────────────────────
  const renderDetail = () => {
    if (!selectedJob) return null;
    const isOpen = selectedJob.status === "OPEN";

    return (
      <>
        <button
          onClick={() => { setPage("jobs"); setSelectedJob(null); setApplications([]); }}
          style={{ ...btnStyle, marginBottom: "1rem", fontSize: 12 }}
        >
          ← Back
        </button>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 8px",
                  borderRadius: 10,
                  marginBottom: 8,
                  background: isOpen ? "#d1fae5" : "#f3f4f6",
                  color: isOpen ? "#065f46" : "#9ca3af",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                {isOpen ? "Open" : "Closed"}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{selectedJob.title}</h2>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9ca3af" }}>
                {selectedJob.department && <span>🏢 {selectedJob.department}</span>}
                {selectedJob.experience && <span>🕐 {selectedJob.experience}</span>}
              </div>
            </div>

            {isOpen && (
              <button
                onClick={() => closeJob(selectedJob._id)}
                style={{ ...btnStyle, background: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5", fontSize: 12 }}
              >
                ✕ Close job
              </button>
            )}
          </div>

          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: "1rem" }}>{selectedJob.description}</p>

            {selectedJob.skills && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Required skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {selectedJob.skills.split(",").map((s) => (
                    <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isOpen && (
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: "1rem",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ede9fe", color: "#5b21b6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  🤖
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>AI candidate screening</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Rank and score all applicants against this job's requirements</div>
                </div>
                <button
                  onClick={() => runAI(selectedJob._id)}
                  disabled={aiLoading}
                  style={{ ...btnPrimary, fontSize: 12, opacity: aiLoading ? 0.7 : 1 }}
                >
                  {aiLoading ? "Running…" : "▶ Run AI"}
                </button>
              </div>
            )}

            {isOpen && (
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: "1rem" }}>
                Close this job to unlock AI screening.
              </p>
            )}

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: 13 }}>
                Screening candidates…
              </div>
            )}

            {!aiLoading && (
              <>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", margin: "1rem 0 0.5rem" }}>
                  Applicants — {applications.length}
                </div>
                {applications.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>No applications yet.</p>
                ) : (
                  applications
                    .slice()
                    .sort((a, b) => (a.aiResult?.rank ?? 999) - (b.aiResult?.rank ?? 999))
                    .map((app) => (
                      <div key={app._id}>
                        <CandidateCard app={app} />
                        <div style={{ marginTop: -6, marginBottom: 14, paddingLeft: 4 }}>
                          <label style={{ fontSize: 12, color: "#6b7280" }}>
                            Recruiter decision:{" "}
                            <select
                              value={app.recruiterDecision || "PENDING"}
                              onChange={(e) => setDecision(app._id, e.target.value)}
                              style={{ fontSize: 12, padding: "3px 6px", borderRadius: 6, border: "1px solid #d1d5db" }}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SHORTLIST">SHORTLIST</option>
                              <option value="REVIEW">REVIEW</option>
                              <option value="REJECT">REJECT</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    ))
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  // ── Layout ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f3f4f6", color: "#111" }}>
      <aside style={{ width: 220, flexShrink: 0, background: "#f9fafb", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "1.25rem 0" }}>
        <div style={{ padding: "0 1.25rem 1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15 }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>TalentOS</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Recruiter Portal</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 0.75rem" }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", padding: "0 0.5rem 0.5rem" }}>
            Overview
          </div>
          {navItem("Dashboard", "⊞", "dashboard")}
          {navItem("All jobs", "≡", "jobs")}
          {navItem("Post a job", "＋", "create")}
        </nav>

        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #e5e7eb", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500 }}>
              RA
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Recruiter Admin</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Full access</div>
            </div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 1.5rem", height: 56, borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>
            {{ dashboard: "Dashboard", jobs: "All jobs", create: "Post a job", detail: selectedJob?.title || "Job detail" }[page]}
          </span>
          <button onClick={loadJobs} style={{ ...btnStyle, fontSize: 12, padding: "5px 10px" }}>↺ Refresh</button>
          <button onClick={logout} style={{ ...btnStyle, fontSize: 12, padding: "5px 10px", background: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" }}>
            Sign out
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {page === "dashboard" && renderDashboard()}
          {page === "jobs" && renderJobs()}
          {page === "create" && renderCreate()}
          {page === "detail" && renderDetail()}
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
