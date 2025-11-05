#!/bin/bash

echo "🔨 Render Build Script"
echo "======================"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --only=production

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

# Setup AI model
echo "🤖 Setting up AI model..."
chmod +x setup_ai.sh
./setup_ai.sh

echo "✅ Build complete!"