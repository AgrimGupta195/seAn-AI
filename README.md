# 🤖 SeAn AI – Your Knowledge, Made Conversational

SeAn AI turns videos, transcripts, and documents into a conversational assistant backed by Retrieval-Augmented Generation (RAG). The current codebase ships a full ingestion-to-chat workflow so creators can upload content, index it with timestamps, and expose the resulting knowledge base through a secure API and a polished React front end. **Always start the backend first (locally or in the cloud) to avoid frontend lag or “server unavailable” errors.**

---

## 🚀 Overview

- **Backend (`backend/`)** – Express, MongoDB, Pinecone, AWS S3, and OpenAI handle auth, ingestion, vectorization, and the `/chat` endpoint secured with API keys.
- **Frontend (`frontend/`)** – React + Vite app with authentication, multi-mode upload flows (documents, videos, subtitles, and YouTube links), real-time chat, and an API dashboard with copy-paste-ready snippets.
- **Python services (`videoTranscript/`)** – FastAPI utilities for YouTube transcript fetching and FFmpeg-powered audio extraction, pushed to S3 for downstream processing.

---

## ✅ Current Feature Set

- **User & API management** – Email signup/login with JWT cookies plus per-user API keys exposed inside the dashboard (`frontend/src/context/AuthContext.jsx`, `backend/controller/authController.js`).
- **Multi-source ingestion UI** – Upload PDFs, DOC/DOCX, TXT, VTT/SRT, full video files, or paste multiple YouTube URLs. Subtitles keep their timestamps and can be linked to source videos for precise references (`frontend/src/pages/UploadPage.jsx`).
- **Transcription + storage pipeline** – Files land in S3, are chunked with overlap, embedded via `text-embedding-3-large`, and stored in Pinecone under the user’s namespace (`backend/controller/uploader.js`). The Python microservice adds on-demand YouTube transcripts and audio extraction for heavy videos.
- **RAG chat with citations** – `/chat` endpoint authenticates via API key, runs the Pinecone search agent, and responds with formatted answers plus per-source timestamps (`backend/controller/chatController.js`, `backend/agents/pickingRightPath.js`).
- **Creator dashboard** – Shows masked API keys, request/response schemas, and language-specific code samples so teams can drop SeAn AI into their stack fast (`frontend/src/pages/DashboardPage.jsx`).
- **Production-ready deployment assets** – Dockerfiles, docker-compose, Render/Vercel guides, and `env.template` ensure consistent provisioning across environments.

---

## 🔍 How It Works

1. **Authenticate** – Creators sign up or log in; sessions are stored server-side via JWT + Mongo.
2. **Ingest** – Each upload normalizes content (including subtitle timestamps), pushes raw assets to S3, and upserts embeddings into a Pinecone namespace keyed to the user.
3. **Ask** – The chat endpoint embeds the query, pulls the top matches from Pinecone, and optionally routes through GPT-4o-mini to stitch a concise answer.
4. **Attribute** – Responses include trimmed source text, filenames, and timestamps so viewers can jump back to the original moment in a video or document.
5. **Integrate** – Creators grab their API key and code snippets to embed SeAn AI inside websites, LMS systems, or support workflows.

---

## 🗂️ Repo Layout

- `backend/` – Express server, auth, ingestion controllers, chat agent, routers, and deployment configs.
- `frontend/` – Vite + React SPA with pages for Home, Uploads, Chat, Dashboard, Login, and Signup.
- `videoTranscript/` – FastAPI helper service for YouTube transcripts and audio extraction to S3.
- `docker-compose*.yml`, `render*.md`, `vercel.json` – Deployment recipes for local, Render, and Vercel setups.
- `env.template` – Master list of environment variables shared across services.

---

## 🛠️ Getting Started Locally

1. **Clone & install deps**
   ```bash
   git clone https://github.com/AgrimGupta195/seAn-AI.git
   cd seAnAI
   npm install              # installs workspace root deps if needed
   cd backend && npm install
   cd ../frontend && npm install
   cd ../videoTranscript && pip install -r requirements.txt
   ```

2. **Configure environment**
   - Copy `env.template` to `.env` in each service that needs it (backend, Python worker, frontend `.env` for `VITE_API_BASE_URL`).
   - Fill in MongoDB, OpenAI, Pinecone, AWS S3, JWT secret, and `PYTHON_SERVICE_URL`.

3. **Run the stack (backend must be live before other services)**
   ```bash
   # Backend
   cd backend
   npm start

   # Python transcripts service
   cd ../videoTranscript
   uvicorn app:app --reload

   # Frontend
   cd ../frontend
   npm run dev -- --port 5173
   ```
   Use `docker-compose.yml` if you prefer containers, or `docker-compose.prod.yml` for a production-like environment.

---

## 📡 API Quickstart

```
POST https://<backend-domain>/api/chat
Headers:
  Content-Type: application/json
  x-api-key: <your-api-key>
Body:
{
  "message": "Summarize module 3 and share the timestamp for the Q&A."
}
```

Response:
```
{
  "answer": "...includes 📹 timestamp entries...",
  "sources": [
    {
      "text": "Short excerpt…",
      "timestamp": "00:12:41",
      "source": "module3.vtt",
      "score": 0.93
    }
  ]
}
```

Use the Dashboard page to copy JS, Python, cURL, or React client snippets that already include your API key and deployment URL.

---

## 💻 Frontend Experience

- **Home** – Marketing hero, key value props, and CTA based on auth state.
- **Upload** – Tabbed workflow for YouTube links, document uploads, raw video ingestion, and subtitle pairing with live success/error toasts.
- **Chat** – Streaming-style chat that shows answers plus per-source citations and timestamps (`frontend/src/pages/ChatPage.jsx`).
- **Dashboard** – API key reveal/copy, sample requests, code tabs, and feature callouts (`frontend/src/pages/DashboardPage.jsx`).
- **Auth** – Minimal login/signup forms wired to the backend auth routes with persistent sessions (`frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/SignupPage.jsx`).

---

## 📦 Deployment Notes

- **Render/Vercel ready** – Use the provided `render.yaml`, `RENDER_*.md`, and `vercel.json` for PaaS deployments. Environment variables mirror `env.template`.
- **Object storage** – AWS S3 bucket stores user uploads; metadata includes `s3Url` references for each chunk.
- **Vector DB** – Pinecone index `seanai` organizes embeddings per user namespace to keep tenant data isolated.
- **OpenAI models** – Currently using `text-embedding-3-large` for vectors and `gpt-4o-mini` for grounded responses. Update `.env` if you need different models or provider keys.
- **Vercel deploys** – Use `vercel.json` + `api/index.js` to host the frontend and Express API together; follow `VERCEL_DEPLOY.md` for step-by-step instructions (Python transcript service still deploys separately).

---

## 🔮 Vision

> “Make every creator’s knowledge instantly explainable, searchable, and conversational.”

SeAn AI already handles ingestion, search, and attribution. Upcoming work focuses on richer analytics, shareable widgets, and additional voice modalities.

