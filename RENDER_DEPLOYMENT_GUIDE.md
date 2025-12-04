# Render Deployment Guide - Backend Server

This guide will walk you through deploying your backend server to Render so it runs constantly without needing your local PC.

---

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. Your code pushed to a Git repository
3. A Render account (free tier available)
4. Your PostgreSQL database already set up on Render

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Update Database Configuration (Already Done)
The `backend/config/db.js` file has been updated to use environment variables. It will use `DATABASE_URL` from Render's environment variables.

### 1.2 Ensure package.json Has Start Script
Your `package.json` already has:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```
Render will use `npm run dev` to run your server with nodemon (auto-restart on changes).

### 1.3 Push Your Code to GitHub

If you haven't already:

1. **Initialize Git** (if not done):
   ```bash
   git init
   ```

2. **Create .gitignore** (already exists):
   - Make sure `node_modules/` and `.env` are ignored

3. **Add and commit your files**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   ```

4. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `campus-task-collab-board`)
   - Don't initialize with README (you already have one)

5. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/campus-task-collab-board.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account (recommended) or email
4. Verify your email if required

---

## Step 3: Create a Web Service on Render

1. **Log into Render Dashboard**
   - Go to https://dashboard.render.com

2. **Click "New +" button** (top right)
   - Select **"Web Service"**

3. **Connect Your Repository**
   - Click **"Connect account"** if you haven't connected GitHub
   - Authorize Render to access your repositories
   - Select your repository: `campus-task-collab-board`
   - Click **"Connect"**

4. **Configure Your Service**

   **Basic Settings:**
   - **Name**: `campus-task-backend` (or any name you prefer)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or `master` if that's your branch)
   - **Root Directory**: `backend` ⚠️ **CRITICAL**: This MUST be set to `backend` or Render won't find your `package.json` file!
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev`

   **Advanced Settings (Click to expand):**
   - **Environment**: `Node`
   - **Node Version**: `18` (or latest stable)

5. **Set Environment Variables**

   Click **"Advanced"** → **"Add Environment Variable"** and add:

   ```
   DATABASE_URL = postgresql://cyril:h9AKVgXQuHWf1PNYCoa2otbokDGdFJJH@dpg-d4o5g3vpm1nc73ft8ci0-a.oregon-postgres.render.com/collab_db_3cl9
   ```

   **OR** if you want to use Render's environment variable (if database is on Render):
   - Render automatically provides `DATABASE_URL` if your database is on Render
   - You can leave it empty and it will use the connected database

   **Additional variables (optional):**
   ```
   NODE_ENV = production
   PORT = 10000
   ```
   (Note: Render automatically sets PORT, but you can override it)

6. **Choose Plan**
   - Select **"Free"** plan (or paid if you need more resources)
   - Free plan includes:
     - 750 hours/month (enough for 24/7 if it's your only service)
     - Automatic SSL
     - Sleeps after 15 minutes of inactivity (wakes on first request)

7. **Create Web Service**
   - Click **"Create Web Service"**
   - Render will start building and deploying your application

---

## Step 4: Monitor Deployment

1. **Watch the Build Logs**
   - You'll see the build process in real-time
   - It will:
     - Clone your repository
     - Run `npm install`
     - Start your server with `npm start`

2. **Check for Errors**
   - If build fails, check the logs
   - Common issues:
     - Missing dependencies → Check `package.json`
     - Database connection errors → Check `DATABASE_URL`
     - Port issues → Render uses PORT environment variable automatically

3. **Wait for "Live" Status**
   - When deployment succeeds, you'll see a green "Live" badge
   - Your service URL will be: `https://your-service-name.onrender.com`

---

## Step 5: Update Frontend API URL

Once your backend is deployed, update your frontend to use the Render URL:

1. **Update `frontend/js/api.js`**:
   ```javascript
   // Change from:
   const API_BASE_URL = 'http://localhost:3000/api';
   
   // To:
   const API_BASE_URL = 'https://your-service-name.onrender.com/api';
   ```

2. **Or use environment-based configuration**:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000/api'
     : 'https://your-service-name.onrender.com/api';
   ```

---

## Step 6: Test Your Deployed Backend

1. **Health Check**:
   - Visit: `https://your-service-name.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

2. **Test API Endpoints**:
   - Use Postman or Thunder Client
   - Test registration: `POST https://your-service-name.onrender.com/api/auth/register`
   - Test login: `POST https://your-service-name.onrender.com/api/auth/login`

---

## Important Notes

### Free Plan Limitations:
- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
  - First request after sleep takes ~30-50 seconds (cold start)
  - Subsequent requests are fast
  - Solution: Use a service like UptimeRobot to ping your service every 10 minutes

### Keep Service Awake (Optional):
1. Sign up for **UptimeRobot** (free): https://uptimerobot.com
2. Add a monitor:
   - Type: HTTP(s)
   - URL: `https://your-service-name.onrender.com/api/health`
   - Interval: 5 minutes
3. This will ping your service and keep it awake

### Database Connection:
- Your PostgreSQL database is already on Render
- The connection string is set in environment variables
- Make sure the database is accessible from your web service

### CORS Configuration:
Your server already has CORS enabled, which is good for frontend access.

---

## Troubleshooting

### Service Won't Start:
- Check build logs for errors
- Verify `package.json` has correct start script
- Check Node version compatibility

### Database Connection Errors:
- Verify `DATABASE_URL` environment variable is set correctly
- Check database is running and accessible
- Verify SSL settings in `db.js`

### 502 Bad Gateway:
- Service might be sleeping (free plan)
- Wait 30-50 seconds for first request
- Check service logs in Render dashboard

### Build Fails:
- Check `package.json` dependencies
- Verify all required files are in repository
- Check build logs for specific error messages

---

## Updating Your Deployment

Whenever you push changes to GitHub:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Render Auto-Deploys**:
   - Render automatically detects changes
   - Starts a new build
   - Deploys when build succeeds
   - You can see progress in Render dashboard

3. **Manual Deploy** (if needed):
   - Go to Render dashboard
   - Click "Manual Deploy" → "Deploy latest commit"

---

## Summary

✅ **What You've Done:**
1. Prepared code for deployment
2. Created Render account
3. Deployed backend as Web Service
4. Set environment variables
5. Updated frontend API URL

✅ **Result:**
- Backend runs 24/7 on Render
- No need to run locally
- Automatic deployments on git push
- Free SSL certificate
- Accessible from anywhere

Your backend is now live at: `https://your-service-name.onrender.com`

---

## Next Steps

1. Test all API endpoints
2. Update frontend to use Render URL
3. Set up UptimeRobot to keep service awake (optional)
4. Monitor logs in Render dashboard
5. Enjoy your always-on backend! 🚀

