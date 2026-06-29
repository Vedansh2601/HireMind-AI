# HireMind AI

An AI-powered recruiting platform. A single recruiter posts jobs, candidates apply with a resume, and an AI workflow (Azure AI Foundry) scores and ranks every applicant — shortlist, review, or reject — once the recruiter closes the role.

---

## How it works

1. **Recruiter posts a job** (open immediately, visible to candidates)
2. **Candidates apply** — name, email, phone, and a PDF resume (parsed to text automatically). One application per candidate per job.
3. **Recruiter closes the job** once they're done accepting applications
4. **Recruiter clicks "Run AI"** — the backend sends every application to a Python service, which calls an Azure AI Foundry agent workflow. The agent extracts skills/experience, scores each candidate against the job description, and ranks them.
5. **Results are saved to MongoDB** (not just shown once) — matched/missing skills, score, decision, rank, and reasoning per candidate. The recruiter's own decision defaults to the AI's call but can be overridden per candidate at any time.

---

## Architecture

```
Frontend (Next.js)
   │
   ▼
Backend (Node.js + Express)  ── MongoDB Atlas (jobs, candidates, applications)
   │
   ▼
Python service (Flask)
   │
   ▼
Azure AI Foundry agent workflow
```

---

## Tech stack

| Layer        | Stack |
|--------------|-------|
| Frontend     | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend      | Node.js, Express |
| Database     | MongoDB Atlas (Mongoose) |
| Auth         | JWT (recruiter login), session-scoped on the frontend |
| File parsing | Multer (upload) + pdf-parse (resume text extraction) |
| AI layer     | Python (Flask) → Azure AI Foundry agent workflow |

---

## Features implemented so far

- **Recruiter auth** — admin key exchanged once for a short-lived JWT (never stored or re-sent from the browser); session-based, so closing the browser logs the recruiter out
- **Job lifecycle** — create → open → close → AI-screenable; only closed jobs can be run through AI
- **Candidate applications** — public apply flow with PDF resume upload, parsed to plain text and stored; duplicate applications to the same job are blocked
- **AI screening** — `run-ai` sends all applicants for a job to the Python/Azure workflow, robustly parses the (sometimes malformed/concatenated) JSON response, and merges both AI stages — matched/missing skills + summary from the scoring stage, and decision/score/rank/reasoning from the ranking stage — into one record per application
- **Recruiter results view** — per-job applicant list with AI scores, skill match breakdown, and a decision dropdown (defaults to the AI's call, fully overridable)
- **Candidate-facing site** — landing page, open-roles list, and an apply form with resume upload
- **Design system** — a single dark "ink" theme (deep background, warm amber accent, serif/mono/sans type pairing) applied consistently across the landing page, candidate pages, and recruiter dashboard

---

## Backend structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Job.js            # title, description, department, skills, experience, status (OPEN/CLOSED)
│   │   ├── Candidate.js      # name, email, phone
│   │   └── Application.js    # candidateId, jobId, resumeText, aiResult, recruiterDecision
│   ├── controllers/
│   │   ├── authController.js        # recruiter login → JWT
│   │   ├── jobController.js         # create/close/list jobs
│   │   ├── applicationController.js# apply, list-by-job, recruiter override
│   │   ├── aiController.js          # run-ai: calls Python service, parses + saves results
│   │   └── candidateController.js   # legacy direct-create endpoint (unused by current flow)
│   ├── middleware/
│   │   ├── adminAuth.js      # verifies the recruiter's JWT
│   │   └── upload.js         # Multer config for PDF resume uploads
│   ├── routes/
│   ├── config/
│   │   ├── db.js             # Mongo connection
│   │   └── azureClient.js
│   └── server.js
├── python_service/
│   └── app.py                 # Flask service: builds the AI prompt, calls Azure, returns raw result
└── .env.example
```

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|--------------|
| POST | `/api/auth/login` | — | Exchange admin key for a JWT |
| GET | `/api/jobs/open` | — | List open jobs (candidate-facing) |
| GET | `/api/jobs` | recruiter | List all jobs |
| POST | `/api/jobs` | recruiter | Create a job |
| PATCH | `/api/jobs/:jobId/close` | recruiter | Close a job |
| POST | `/api/jobs/:jobId/run-ai` | recruiter | Run AI screening on a closed job's applicants |
| POST | `/api/applications` | — | Apply to a job (`multipart/form-data` with a `resume` PDF, or JSON with `resumeText`) |
| GET | `/api/jobs/:jobId/applications` | recruiter | List applications + AI results for a job |
| PATCH | `/api/applications/:applicationId/decision` | recruiter | Override the recruiter's decision for one application |

Recruiter-only routes require `Authorization: Bearer <token>`.

---

## Frontend structure

```
frontend/src/app/
├── page.tsx              # Landing page — routes to /jobs or /dashboard
├── jobs/page.tsx          # Open roles + apply modal (resume upload)
├── dashboard/page.tsx     # Recruiter portal: login, post/close jobs, run AI, review results
├── components/icons.tsx   # Shared inline-SVG icon set
├── layout.tsx             # Global nav + font loading
└── globals.css            # Design tokens (color, type) shared by every page
```

---

## Environment variables (`backend/.env`)

```
PORT=5000
MONGODB_URL=your_mongodb_atlas_connection_string
ADMIN_KEY=choose_a_strong_value
JWT_SECRET=choose_a_long_random_string
PYTHON_AI_URL=http://localhost:8000/run-workflow
AZURE_PROJECT_ENDPOINT=
AZURE_WORKFLOW_NAME=
```

See `backend/.env.example`.

---

## Running locally

```bash
# Backend
cd backend
npm install
node src/server.js

# Python AI service (needs Azure credentials configured)
cd backend/python_service
python app.py

# Frontend
cd frontend
npm install
npm run dev
```

---

## Known limitations / not yet built

- Resumes must be PDF (no `.docx` support yet)
- No email notifications to candidates on decision
- No multi-recruiter accounts — single shared admin key
- AI screening calls are synchronous (blocking) rather than queued — fine at current scale, would need a job queue for larger batches
- No automated tests yet

## Status

In active development.
