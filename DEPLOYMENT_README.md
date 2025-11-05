# 🚀 Heart Rate Monitor API - Deployment Guide

## 🌐 Free Hosting Options

### 1. **Railway** (Recommended) ⭐
- ✅ Free tier: 512MB RAM, 1GB storage
- ✅ Built-in MongoDB support
- ✅ Automatic deployments from GitHub
- ✅ Custom domains

### 2. **Render** (Alternative) ⭐
- ✅ Free tier: 750 hours/month
- ✅ Node.js + Python support
- ✅ Automatic SSL certificates
- ✅ Custom domains
- ⚠️ Need MongoDB Atlas (free tier available)

### 3. **Fly.io**
- ✅ Free tier: 3 shared CPUs, 256MB RAM
- ✅ Good for full-stack apps

---

## 🎨 Deploy to Render

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create a new cluster (free tier)
4. Create database user and get connection string

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 3: Create Web Service
1. Click "New" → "Web Service"
2. Connect your `BE_Project` repository
3. Configure settings:
   - **Name**: `heart-rate-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run setup-ai`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Step 4: Set Environment Variables
In Render dashboard, add these environment variables:

```
NODE_ENV=production
JWT_SECRET=your_super_secure_random_string_here
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/heart_rate_db
```

### Step 5: Deploy
Render will automatically deploy when you push to main branch!

---

## 🚂 Deploy to Railway (Alternative)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2: Create Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `BE_Project` repository

### Step 3: Add MongoDB Database
1. In your Railway project, click "Add Plugin"
2. Choose "MongoDB"
3. Railway will automatically create and configure MongoDB

### Step 4: Set Environment Variables
In Railway dashboard, go to "Variables" and add:

```
JWT_SECRET=your_super_secure_random_string_here
NODE_ENV=production
```

### Step 5: Deploy
Railway will automatically deploy when you push to main branch!

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2: Create Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `BE_Project` repository

### Step 3: Add MongoDB Database
1. In your Railway project, click "Add Plugin"
2. Choose "MongoDB"
3. Railway will automatically create and configure MongoDB

### Step 4: Set Environment Variables
In Railway dashboard, go to "Variables" and add:

```
JWT_SECRET=your_super_secure_random_string_here
NODE_ENV=production
```

### Step 5: Deploy
Railway will automatically deploy when you push to main branch!

---

## 🔧 Manual Deployment (Alternative)

### Using Docker
```bash
# Build the image
docker build -t heart-rate-api .

# Run locally
docker run -p 3000:3000 -e JWT_SECRET=your_secret -e MONGODB_URI=your_mongo_uri heart-rate-api
```

### Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Add MongoDB
railway add mongodb

# Deploy
railway up
```

---

## 📡 API Endpoints (After Deployment)

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Heart Rate Monitoring
```
POST /api/heartrate/record
GET  /api/heartrate/history
GET  /api/heartrate/latest
GET  /api/heartrate/stats
```

### Example Usage
```bash
# Register user
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Record heart rate (use token from login)
curl -X POST https://your-app.railway.app/api/heartrate/record \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"heartRate":75,"ecg":120,"acc":[1.0,0.8,1.2],"notes":"Morning check"}'
```

---

## 🔍 Testing Your Deployment

1. **Health Check**: Visit `https://your-app.railway.app/api/heartrate/history?userId=test`
2. **Postman**: Import the `Heart_Rate_Monitor_API.postman_collection.json`
3. **AI Test**: Record a heart rate and check if AI diagnosis works

---

## 🐛 Troubleshooting

### Common Issues:

1. **AI Model Not Loading**
   - Check if `heart_diagnosis_model.pkl` exists
   - Run `npm run setup-ai` in Railway build

2. **MongoDB Connection**
   - Check Railway MongoDB plugin is added
   - Verify `MONGODB_URI` environment variable

3. **Python Dependencies**
   - Railway should install from `requirements.txt`
   - Check build logs for Python errors

---

## 💰 Cost Estimation

- **Railway Free Tier**: $0/month (512MB RAM, 1GB storage)
- **Railway Pro**: $5/month (8GB RAM, 100GB storage)
- **Custom Domain**: Free on Railway

---

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test locally first: `npm start`

Happy deploying! 🎉