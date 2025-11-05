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

# Install Python dependencies with fallback (handle PEP 668 / managed env)
echo "📦 Installing Python dependencies..."
if ! pip3 install -r requirements.txt 2>/dev/null; then
    echo "⚠️  Direct install failed (possibly managed environment). Creating virtual env..."
    python3 -m venv ai_env
    source ai_env/bin/activate
    if ! pip install -r requirements.txt; then
        echo "❌ Failed to install Python dependencies even in virtual env"
        exit 1
    fi
    echo "✅ Dependencies installed inside virtual environment"
else
    echo "✅ Python dependencies installed"
fi

# Check if model exists
if [ ! -f "heart_diagnosis_model.pkl" ]; then
    echo "🤖 Training AI model (this may take a few minutes)..."
    python3 ai_heart_diagnosis.py
else
    echo "✅ AI model already exists"
fi

# Test the AI (use venv python if exists)
echo "🧪 Testing AI diagnosis..."
PYBIN="python3"
if [ -f "ai_env/bin/python" ]; then
    PYBIN="ai_env/bin/python"
fi
$PYBIN run_ai.py 85 45 1 130 220

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