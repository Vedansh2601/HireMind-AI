"use client";

import { useEffect, useState } from "react";
import { IconClose, IconBuilding, IconClock } from "../components/icons";

interface Job {
  _id: string;
  title: string;
  description: string;
  department?: string;
  skills?: string;
  experience?: string;
}

const API = "http://localhost:5000/api";
const mono = { fontFamily: "var(--font-mono)" };
const display = { fontFamily: "var(--font-display)" };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    fetch(`${API}/jobs/open`)
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .catch(() => setError("Could not load jobs — is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const openApply = (job: Job) => {
    setApplyJob(job);
    setName(""); setEmail(""); setPhone(""); setResumeFile(null);
    setSubmitMsg(""); setSubmitOk(false);
  };

  const submitApplication = async () => {
    if (!applyJob) return;

    if (!name.trim() || !email.trim() || !resumeFile) {
      setSubmitOk(false);
      setSubmitMsg("Name, email, and a resume PDF are required.");
      return;
    }

    setSubmitting(true);
    setSubmitMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("jobId", applyJob._id);
      formData.append("resume", resumeFile);

      const res = await fetch(`${API}/applications`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setSubmitOk(true);
        setSubmitMsg("Application submitted — we'll be in touch.");
      } else {
        setSubmitOk(false);
        setSubmitMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitOk(false);
      setSubmitMsg("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-xs text-[#e2a33d] mb-3 tracking-widest uppercase" style={mono}>
        Open roles
      </div>
      <h1 className="text-3xl mb-2" style={{ ...display, fontWeight: 600 }}>
        Find your next role
      </h1>
      <p className="text-[#8b96a3] text-sm mb-10">
        Apply directly — no account needed.
      </p>

      {loading && <p className="text-[#8b96a3] text-sm">Loading roles…</p>}
      {error && <p className="text-[#d9716b] text-sm">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <div className="border border-[#2b3340] bg-[#171c24] rounded-2xl p-8 text-center" style={{ boxShadow: "0 10px 24px -12px rgba(0,0,0,0.6)" }}>
          <p className="text-[#8b96a3] text-sm">No open roles right now. Check back soon.</p>
        </div>
      )}

      <div className="grid gap-3">
        {jobs.map((job, i) => (
          <div
            key={job._id}
            className="hm-fade-in border border-[#2b3340] border-t-2 border-t-[#5fbe8a] bg-[#171c24] rounded-2xl p-5 hover:border-[#e2a33d]/40 hover:-translate-y-0.5 transition-all"
            style={{ boxShadow: "0 10px 24px -12px rgba(0,0,0,0.6)", animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg mb-1" style={{ ...display, fontWeight: 500 }}>
                  {job.title}
                </h2>
                <p className="text-sm text-[#8b96a3] mb-2 line-clamp-2">{job.description}</p>
                <div className="flex gap-3 text-xs text-[#8b96a3]" style={mono}>
                  {job.department && (
                    <span className="inline-flex items-center gap-1">
                      <IconBuilding size={12} /> {job.department}
                    </span>
                  )}
                  {job.experience && (
                    <span className="inline-flex items-center gap-1">
                      <IconClock size={12} /> {job.experience}
                    </span>
                  )}
                </div>
                {job.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.split(",").map((s) => (
                      <span
                        key={s}
                        className="text-xs text-[#e2a33d] border border-[#e2a33d]/30 bg-[#e2a33d]/10 rounded-full px-2 py-0.5"
                        style={mono}
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => openApply(job)}
                className="shrink-0 bg-[#e2a33d] text-[#10141a] text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#eab564] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* APPLY MODAL */}
      {applyJob && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#171c24] border border-[#2b3340] rounded-2xl p-6 w-full max-w-md" style={{ boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ ...display, fontWeight: 500, fontSize: 18 }}>
                Apply to {applyJob.title}
              </h3>
              <button onClick={() => setApplyJob(null)} className="text-[#8b96a3] hover:text-[#eceff3]">
                <IconClose size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#10141a] border border-[#2b3340] rounded-lg px-3 py-2 text-sm placeholder:text-[#8b96a3] focus:outline-none focus:border-[#e2a33d]/60"
              />
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#10141a] border border-[#2b3340] rounded-lg px-3 py-2 text-sm placeholder:text-[#8b96a3] focus:outline-none focus:border-[#e2a33d]/60"
              />
              <input
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#10141a] border border-[#2b3340] rounded-lg px-3 py-2 text-sm placeholder:text-[#8b96a3] focus:outline-none focus:border-[#e2a33d]/60"
              />

              <label className="text-sm">
                <span className="block text-[#8b96a3] mb-1">Resume (PDF only)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-[#8b96a3]"
                />
              </label>

              {submitMsg && (
                <p className={`text-sm ${submitOk ? "text-[#5fbe8a]" : "text-[#d9716b]"}`}>{submitMsg}</p>
              )}

              <button
                onClick={submitApplication}
                disabled={submitting}
                className="bg-[#e2a33d] text-[#10141a] text-sm font-medium rounded-lg px-4 py-2 mt-1 hover:bg-[#eab564] disabled:opacity-60 transition-colors"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
