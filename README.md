# 🚀 HireMind AI

HireMind AI is an intelligent recruitment system that automates resume parsing, job matching, and candidate shortlisting using AI agents.

---

## 🧠 Project Overview

HireMind AI helps recruiters by:
- Parsing candidate resumes
- Extracting structured information
- Matching candidates with job descriptions
- Generating AI-based shortlisting decisions
- Allowing recruiter overrides
- Preparing for automated email sending

---

## 🏗️ Architecture

Frontend (Next.js)

↓

Backend (Node.js + Express)

↓

AI Layer (Azure AI Foundry Agents)

↓

MongoDB Atlas Database

---

## ⚙️ Tech Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- AI: Azure AI Foundry
- ORM: Mongoose

---

## 📦 Features

- Resume parsing API
- Candidate data extraction
- Job matching logic
- AI scoring system
- Recruiter decision override
- MongoDB integration

---

## 🧩 Backend Structure

backend/
├── src/
│ ├── models/ # MongoDB schemas
│ ├── controllers/ # Business logic
│ ├── routes/ # API routes
│ ├── services/ # AI / external services
│ └── server.js # Entry point

---

## 🔌 API Endpoints

POST /api/candidate

Request body:

{

"name": "John Doe",

"email": "john@gmail.com",

"skills": ["React", "Node.js"],

"resumeText": "Frontend developer with experience"

}

---

## 🗄️ Database

MongoDB Collection:
candidates

Stores:
- Candidate info
- Skills
- Experience
- AI evaluation
- Recruiter decision

---

## 🚀 Future Improvements

- AI agent workflow automation
- Resume file upload (PDF parsing)
- Recruiter dashboard UI
- Email automation
- Deployment (Vercel + Azure)

---

## 👨‍💻 Author

Vedansh Shinde

---

## 📌 Status

In Active Development