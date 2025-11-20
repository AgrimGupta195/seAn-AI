# Deploy SeAn AI to Vercel 🚀

Vercel hosts the React frontend and Express API (via serverless functions). The Python `videoTranscript` service still runs on Render/Railway and is consumed through `PYTHON_SERVICE_URL`.

---

## 1. Prerequisites

- MongoDB Atlas connection string.
- AWS S3 bucket + credentials (region, access key, secret, bucket).
- OpenAI + Pinecone API keys.
- Hosted Python transcript service URL (Render/Railway/etc.).
- Vercel CLI (`npm i -g vercel`) or a connected GitHub repo.

---

## 2. Configure Environment Variables

Create a `.env` locally (copy `env.template`) and populate the following keys—then add the same values inside Vercel’s project settings:

| Key | Notes |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas URI |
| `JWT_SECRET` | Any strong random string |
| `OPENAI_API_KEY` | Used for embeddings + completions |
| `PINECONE_API_KEY` | Pinecone vector index |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` | Needed for S3 uploads |
| `PYTHON_SERVICE_URL` | Public URL of the transcript microservice (e.g., Render) |
| `ALLOWED_ORIGINS` (optional) | Comma-separated list of trusted domains |

Vercel also injects `VERCEL_URL` + `VERCEL_BRANCH_URL` automatically; `backend/app.js` whitelists those for CORS.

---

## 3. Deploy the Python Service (External)

1. `cd videoTranscript`
2. Deploy to Render/Railway (`docker` or native) with the same AWS credentials.
3. Grab the public HTTPS URL and keep it handy for `PYTHON_SERVICE_URL`.

---

## 4. Deploy to Vercel

### Using the CLI
```bash
vercel login
vercel link          # or `vercel` in repo root, pick project
vercel env add MONGO_URI
vercel env add JWT_SECRET
# ...add all env vars listed above
vercel --prod        # runs `vercel-build` script defined in package.json
```

### Using GitHub
1. Push to GitHub.
2. Import the repo on vercel.com.
3. Set all env vars under **Project Settings → Environment Variables**.
4. Trigger a Production deploy (Vercel uses `vercel.json` for build + rewrites).

---

## 5. How It Works on Vercel

- `vercel.json` builds the frontend (`frontend/dist`) and bundles `api/index.js` as the serverless function.
- The Express app from `backend/` runs inside that function; uploads stream correctly because `api/index.js` disables the default body parser.
- `/api/*` routes are proxied to the serverless function, while everything else serves the SPA.
- `frontend/src/lib/axios` points to `/api`, so no extra configuration is necessary once `VITE_API_BASE_URL=/api`.

---

## 6. Post-Deploy Checklist

1. Open `<project>.vercel.app`, sign up a test user, and upload a small PDF to confirm S3 + Pinecone inserts succeed.
2. Run a chat query to verify API key auth + RAG flow.
3. Confirm transcripts/subtitle uploads reach the external Python service (check its logs).
4. If you add a custom domain, append it to `ALLOWED_ORIGINS` so CORS stays permissive.

That’s it—SeAn AI is now fully Vercel-ready while keeping the heavy Python work on your preferred runtime. 🎉

