# Salon App - Setup & Deployment Guide

## 🚀 Quick Start - Local Development

### 1. Start the Backend
```bash
cd backend
npm start
```
Backend will run on: **http://localhost:5000**

### 2. Start the Frontend  
```bash
cd gilded-appointments
npm run dev
```
Frontend will run on: **http://localhost:5173**

---

## ✅ What Was Fixed

1. **Fixed CORS Configuration** 
   - Backend now allows requests from `http://localhost:5173` (frontend)
   - Previously was incorrectly set to `http://localhost:5000` (pointing to itself)

2. **Fixed Environment Files**
   - Created `.env.development` for local testing
   - Created `.env.production` for Render deployment
   - Updated `.env` to point to `http://localhost:5000`

3. **Improved Error Messages**
   - Better error handling for network failures
   - Clear messages if backend URL is not configured
   - Helpful debugging information in console

4. **Backend Scripts**
   - Added `npm start` and `npm dev` scripts to package.json

---

## 🌐 Production Deployment (Render)

### Step 1: Deploy Backend to Render

1. Go to [https://render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node app.js`
   - **Environment Variables:**
     ```
     MONGO_URI=<your_mongo_uri>
     JWT_SECRET=<your_secret>
     FRONTEND_URL=https://your-frontend-domain.com
     EMAIL_USER=<your_email>
     EMAIL_PASS=<your_password>
     NODE_ENV=production
     ```

5. Deploy! You'll get a URL like: `https://your-app-name.onrender.com`

### Step 2: Update Frontend Configuration

1. Update `.env.production` with your backend URL:
   ```
   VITE_API_URL=https://your-app-name.onrender.com
   ```

2. Update backend `.env` with your frontend URL:
   ```
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Step 3: Deploy Frontend to Vercel

1. Push your changes to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Vite configuration ✅
5. Deploy! You get a URL: `https://your-app.vercel.app`

---

## 🔧 Environment Files Explained

### `.env` (Local Development)
```
VITE_API_URL=http://localhost:5000
```

### `.env.development` 
```
VITE_API_URL=http://localhost:5000
```

### `.env.production`
```
VITE_API_URL=https://your-backend-render-url.onrender.com
```

---

## 📝 CORS Configuration (Backend)

The backend now allows requests from:
- ✅ `http://localhost:5173` (Local frontend)
- ✅ `http://localhost:3000` (Alternative local port)
- ✅ `https://gilded-appointments.vercel.app` (Production)
- ✅ Custom URL from `FRONTEND_URL` env variable

---

## ❌ If You Still Get "Failed to Fetch" Error

1. **Check Backend is Running**
   ```bash
   cd backend
   npm start
   # Should see: "Server running on http://localhost:5000"
   ```

2. **Check API URL in Console**
   - Open Browser DevTools (F12)
   - Go to Console tab
   - You should see: `[API] GET http://localhost:5000/api/auth/signup`

3. **Check CORS Headers**
   - Open Network tab
   - Try signup
   - Look for the request, check Response Headers
   - Should have `access-control-allow-origin: http://localhost:5173`

4. **Check Firewall**
   - Port 5000 should be open/accessible

---

## 🚢 Rendering Deployment URL

Once deployed on Render, your backend URL might look like:
```
https://salon-backend-xyz.onrender.com
```

Update `.env.production` to this URL, then redeploy frontend.

---

## 💡 IMPORTANT: For Render Cold Starts

Render free tier apps spin down after 15 minutes. First request might be slow. To keep it warm:
1. Use Render's scheduler feature (paid)
2. Or: Use a monitoring service like UptimeRobot to ping your API every 5 minutes

---

Happy coding! 🎉
