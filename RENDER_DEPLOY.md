# Deploy SeAnAI to Render

Complete guide to deploy your full-stack application to Render using Docker.

## 🎯 Why Render?

- ✅ **Free Tier Available** - Web services with 15min sleep
- ✅ **Docker Support** - Full Docker and Docker Compose support
- ✅ **Easy Setup** - GitHub integration
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **No Credit Card Required** - For free tier

## 📋 Prerequisites

1. GitHub account
2. Render account (sign up at https://render.com)
3. Your code pushed to GitHub

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended - All Services Together)

Render supports Docker Compose, but you need to deploy each service separately.

### Option 2: Individual Services (More Control)

Deploy each service (Frontend, Backend, Python) as separate web services.

> ⚠️ **Recommended Startup Order (avoids frontend errors):**
> 1. Deploy the Python helper (`seanai-python`) and wait for its root URL (`/`) to return 200.
> 2. Deploy the backend (`seanai-backend`). Confirm `/api/healthz` is healthy before moving on.
> 3. Deploy the frontend (`seanai-frontend`) only after the backend is live, and redeploy it whenever the backend URL or API key changes.
>
> This mirrors the Docker workflow where backend services come online before the React UI, preventing Render from serving a frontend that points to an unavailable API.

---

## 📦 Option 1: Deploy with Docker Compose (Simpler)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/seanai.git
git push -u origin main
```

### Step 2: Create Render Blueprint

Create `render.yaml` in your root directory:

```yaml
services:
  # Frontend Service
  - type: web
    name: seanai-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    dockerContext: ./frontend
    plan: free  # or starter for always-on
    envVars:
      - key: VITE_API_BASE_URL
        value: /api
    healthCheckPath: /
    
  # Backend Service
  - type: web
    name: seanai-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    plan: free  # or starter for always-on
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGO_URI
        sync: false  # Set manually
      - key: JWT_SECRET
        generateValue: true  # Auto-generate
      - key: OPENAI_API_KEY
        sync: false
      - key: PINECONE_API_KEY
        sync: false
      - key: AWS_REGION
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_BUCKET_NAME
        sync: false
      - key: PYTHON_SERVICE_URL
        fromService:
          name: seanai-python
          type: web
          property: host
    healthCheckPath: /api/healthz
    
  # Python Service
  - type: web
    name: seanai-python
    env: docker
    dockerfilePath: ./videoTranscript/Dockerfile
    dockerContext: ./videoTranscript
    plan: free  # or starter for always-on
    envVars:
      - key: PORT
        value: 8000
      - key: AWS_REGION
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_BUCKET_NAME
        sync: false
    healthCheckPath: /
```

### Step 3: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Click **"Apply"**
6. Render will create all 3 services

### Step 4: Set Environment Variables

For each service, go to **Environment** tab and add:

**Backend Service:**
```
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
```

**Python Service:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
```

### Step 5: Update Frontend Nginx Config

Since services are separate, you have two options:

**Option A: Use Render-specific config (Recommended)**

1. Copy `frontend/nginx.render.conf` to `frontend/nginx.conf`
2. Update the `$backend_url` variable with your actual backend URL:
   ```nginx
   set $backend_url "https://seanai-backend-skk0.onrender.com";
   ```

**Option B: Update existing nginx.conf**

Replace `proxy_pass http://backend:5000;` with your backend URL:
```nginx
location /api {
    proxy_pass https://seanai-backend-skk0.onrender.com;  # Your backend URL
    # ... rest of config
}
```

**Note:** Your actual backend URL is: `https://seanai-backend-skk0.onrender.com`

---

## 📦 Option 2: Deploy Services Individually (More Control)

### Step 1: Deploy Python Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Name**: `seanai-python`
   - **Environment**: `Docker`
   - **Region**: Choose closest
   - **Branch**: `main`
   - **Root Directory**: `videoTranscript`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `videoTranscript`
5. Add Environment Variables:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_BUCKET_NAME=your-bucket
   PORT=8000
   ```
6. Click **"Create Web Service"**
7. Copy the service URL (e.g., `https://seanai-python.onrender.com`)

### Step 2: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `seanai-backend`
   - **Environment**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `backend`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=...
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_BUCKET_NAME=...
   PYTHON_SERVICE_URL=https://seanai-python.onrender.com
   ```
5. Click **"Create Web Service"**
6. Copy the service URL (e.g., `https://seanai-backend-skk0.onrender.com`)

### Step 3: Deploy Frontend Service

1. Click **"New +"** → **"Web Service"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `seanai-frontend`
   - **Environment**: `Docker`
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `frontend`
4. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://seanai-backend-skk0.onrender.com/api
   ```
5. Update `frontend/nginx.conf` to proxy to your backend URL
6. Click **"Create Web Service"**
7. Copy the service URL (e.g., `https://seanai-frontend-ivl4.onrender.com`)

---

## 🔧 Configuration Updates Needed

### 1. Update Frontend Nginx Config

Since services are on different URLs, update `frontend/nginx.conf`:

```nginx
location /api {
    proxy_pass https://seanai-backend-skk0.onrender.com;
    # ... rest of config
}
```

Or use environment variable in Dockerfile to set backend URL dynamically.

### 2. Update Backend CORS

Update `backend/app.js` to include Render URLs:

```javascript
const renderOrigins = [
  "https://seanai-frontend-ivl4.onrender.com",
  "https://seanai-backend-skk0.onrender.com"
];

const allowedOrigins = [...defaultOrigins, ...envOrigins, ...renderOrigins];
```

### 3. Update Python Service URL

In backend environment variables, set:
```
PYTHON_SERVICE_URL=https://seanai-python.onrender.com
```

---

## 💰 Pricing

### Free Tier:
- **Web Services**: Free (sleep after 15min inactivity)
- **Limitations**: 
  - Services spin down after 15min
  - First request after sleep takes ~30-60s
  - 750 hours/month total

### Starter Plan ($7/month per service):
- **Always-on** services
- No cold starts
- Better for production

**Estimated Cost:**
- Free: $0 (with cold starts)
- Starter: $21/month (3 services × $7)

---

## ⚙️ Render-Specific Settings

### Health Checks

Render automatically checks:
- Backend: `/api/healthz`
- Python: `/`
- Frontend: `/`

### Auto-Deploy

- Automatically deploys on git push to main branch
- Can enable manual deploys only in settings

### Custom Domains

1. Go to service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records as shown

---

## 🐛 Troubleshooting

### Services won't start
- Check build logs in Render dashboard
- Verify environment variables are set
- Check Dockerfile paths are correct

### Cold starts (Free tier)
- First request after 15min sleep takes time
- Upgrade to Starter plan for always-on

### CORS errors
- Add Render URLs to backend CORS configuration
- Check frontend is using correct API URL

### Python service not reachable
- Verify `PYTHON_SERVICE_URL` is set correctly
- Check Python service is deployed and running
- Verify health check is passing

### Build fails
- Check Dockerfile syntax
- Verify all dependencies in requirements.txt/package.json
- Check build logs for specific errors

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] All 3 services created (or blueprint deployed)
- [ ] Environment variables set for each service
- [ ] Frontend nginx.conf updated with backend URL
- [ ] Backend CORS updated with frontend URL
- [ ] Python service URL set in backend
- [ ] Health checks passing
- [ ] Test all endpoints

---

## 🚀 Quick Start Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for Render deployment"
git push

# 2. Go to Render dashboard
# 3. Create services (follow steps above)
# 4. Set environment variables
# 5. Deploy!
```

---

## 📞 Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Community: https://community.render.com

---

## 💡 Pro Tips

1. **Use Blueprint** - Easier to manage all services together
2. **Start with Free Tier** - Test everything, then upgrade
3. **Monitor Logs** - Use Render dashboard to debug issues
4. **Set up Alerts** - Get notified of deployment failures
5. **Use Custom Domains** - More professional URLs

---

Ready to deploy? Follow the steps above and your SeAnAI app will be live on Render! 🎉

