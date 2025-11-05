#!/bin/bash

echo "🫀 AI Heart Diagnosis System Setup"
echo "=================================="

# Check Python
echo "🐍 Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.7+"
    exit 1
fi

python3 --version

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed"

# Check if model exists
if [ ! -f "heart_diagnosis_model.pkl" ]; then
    echo "🤖 Training AI model (this may take a few minutes)..."
    python3 ai_heart_diagnosis.py
else
    echo "✅ AI model already exists"
fi

# Test the AI
echo "🧪 Testing AI diagnosis..."
python3 run_ai.py 85 45 1 130 220

if [ $? -eq 0 ]; then
    echo "✅ AI system ready!"
    echo ""
    echo "🚀 To start the Node.js server:"
    echo "   npm start"
    echo ""
    echo "📖 Read AI_README.md for detailed usage"
else
    echo "❌ AI test failed"
    exit 1
fi