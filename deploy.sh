#!/bin/bash

echo "🚂 Railway Deployment Script for Heart Rate Monitor API"
echo "======================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Link project (assuming you're in the project directory)
echo "🔗 Linking project..."
railway link

# Add MongoDB plugin
echo "🗄️ Adding MongoDB plugin..."
railway add mongodb

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Railway will automatically deploy"
echo "3. Check your Railway dashboard for the deployment URL"
echo ""
echo "🔗 Your API will be available at: https://your-project-name.railway.app"
echo ""
echo "🧪 Test endpoints:"
echo "GET  /api/heartrate/history?userId=test"
echo "POST /api/auth/register"
echo "POST /api/auth/login"