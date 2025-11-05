#!/bin/bash

echo "🎨 Render Deployment Helper Script"
echo "=================================="

echo "📋 Prerequisites:"
echo "1. MongoDB Atlas account: https://mongodb.com/atlas"
echo "2. Render account: https://render.com"
echo "3. GitHub repository connected"
echo ""

echo "🗄️ MongoDB Atlas Setup:"
echo "1. Create free cluster"
echo "2. Create database user"
echo "3. Get connection string: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
echo ""

echo "🎨 Render Setup:"
echo "1. New Web Service from GitHub repo"
echo "2. Runtime: Node"
echo "3. Build Command: npm install && npm run setup-ai"
echo "4. Start Command: npm start"
echo "5. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=<secure-random-string>"
echo "   - MONGODB_URI=<mongodb-atlas-connection-string>"
echo ""

echo "✅ After deployment, your API will be available at:"
echo "https://your-service-name.onrender.com"
echo ""

echo "🧪 Test your deployment:"
echo "GET https://your-service-name.onrender.com/api/heartrate/history?userId=test"