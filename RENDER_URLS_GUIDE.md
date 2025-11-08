# How to Find Your Render Service URLs

After deploying your blueprint, here's where to find all your service URLs.

## 🎯 Finding Service URLs

### Step 1: Go to Render Dashboard

1. Go to https://dashboard.render.com
2. You should see your services listed

### Step 2: Find Each Service

You should see 3 services:
- `seanai-frontend`
- `seanai-backend`
- `seanai-python`

### Step 3: Get the URL

For each service:

1. **Click on the service name** (e.g., `seanai-frontend`)
2. Look at the top of the page
3. You'll see a URL like:
   ```
   https://seanai-frontend.onrender.com
   ```
4. **Copy this URL**

## 📋 Your Service URLs

After deployment, you'll have:

### Frontend URL
```
https://seanai-frontend-ivl4.onrender.com
```
- This is your main application URL
- Users will access your app here

### Backend URL (API Endpoint)
```
https://seanai-backend-skk0.onrender.com
```
- This is your API URL
- Used by frontend to make API calls
- API Base: `https://seanai-backend-skk0.onrender.com/api`

### Python Service URL
```
https://seanai-python.onrender.com
```
- This is your Python service URL
- Used by backend for video processing

## 🔧 Next Steps After Getting URLs

### 1. Update Frontend Nginx Config

1. Go to your `frontend/nginx.render.conf`
2. Update the backend URL:
   ```nginx
   set $backend_url "https://seanai-backend-skk0.onrender.com";
   ```
3. Your actual backend URL is: `https://seanai-backend-skk0.onrender.com`
4. Copy `nginx.render.conf` to `nginx.conf`:
   ```bash
   cp frontend/nginx.render.conf frontend/nginx.conf
   ```
5. Commit and push:
   ```bash
   git add frontend/nginx.conf
   git commit -m "Update nginx config with backend URL"
   git push
   ```
6. Render will auto-deploy the update

### 2. Update Backend Environment Variables

1. Go to `seanai-backend` service in Render
2. Click **"Environment"** tab
3. Update `PYTHON_SERVICE_URL`:
   ```
   PYTHON_SERVICE_URL=https://seanai-python.onrender.com
   ```
4. Replace with your actual Python service URL
5. Click **"Save Changes"**
6. Service will restart automatically

### 3. Update Backend CORS (Optional)

If you get CORS errors:

1. Go to `seanai-backend` service
2. Click **"Environment"** tab
3. Add or update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://seanai-frontend.onrender.com
   ```
4. Click **"Save Changes"**

## 🧪 Testing Your URLs

### Test Frontend
```bash
curl https://seanai-frontend-ivl4.onrender.com
```
Should return HTML

### Test Backend Health
```bash
curl https://seanai-backend-skk0.onrender.com/api/healthz
```
Should return: `{"status":"ok"}`

### Test Python Service
```bash
curl https://seanai-python.onrender.com
```
Should return: `{"message":"SeAn AI Python Services",...}`

## 📍 Where URLs Are Displayed

In Render Dashboard:

1. **Service List View:**
   - Each service shows its URL in the list
   - Format: `https://service-name.onrender.com`

2. **Service Detail View:**
   - Click on service name
   - URL is shown at the top
   - Also in the "Info" section

3. **Settings Tab:**
   - Go to service → Settings
   - URL is shown under "Service Details"

## 🔗 Custom Domains (Optional)

To use your own domain:

1. Go to service → Settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

## ⚠️ Important Notes

1. **Free Tier URLs:**
   - Services sleep after 15min inactivity
   - First request after sleep takes ~30-60s
   - URLs always work, just slower on first request

2. **Starter Plan:**
   - Services are always-on
   - No cold starts
   - Faster response times

3. **URL Format:**
   - Always HTTPS (SSL automatic)
   - Format: `https://service-name.onrender.com`
   - Cannot change the subdomain on free tier

## 🎯 Quick Checklist

- [ ] Found frontend URL
- [ ] Found backend URL
- [ ] Found Python service URL
- [ ] Updated frontend nginx.conf with backend URL
- [ ] Updated backend PYTHON_SERVICE_URL
- [ ] Tested all URLs
- [ ] Set all environment variables

## 🆘 Can't Find URLs?

1. **Check Service Status:**
   - Services must be "Live" (green status)
   - If "Building" or "Failed", wait or check logs

2. **Check Service Name:**
   - URL uses service name
   - If you renamed service, URL changes

3. **Check Render Dashboard:**
   - Make sure you're logged in
   - Check correct account/organization

4. **Check Logs:**
   - Service → Logs tab
   - Look for deployment errors

---

**Your main app URL is the Frontend URL!** 🎉

Share that URL with users to access your SeAnAI application.

