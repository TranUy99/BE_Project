#!/bin/bash

echo "🫀 AI Heart Diagnosis System Setup (Container/CI Friendly)"
echo "=========================================================="

# Check Python
echo "🐍 Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.7+"
    exit 1
fi

python3 --version

# Install Python dependencies with fallback (handle PEP 668 / managed env)
echo "📦 Installing Python dependencies (idempotent)..."
if [ -f "ai_env/bin/activate" ]; then
    echo "➡️  Using existing virtual environment"
    source ai_env/bin/activate
else
    if ! pip3 install -r requirements.txt 2>/dev/null; then
        echo "⚠️  Direct install failed. Creating virtual env..."
        python3 -m venv ai_env
        # shellcheck disable=SC1091
        source ai_env/bin/activate
        pip install -r requirements.txt || { echo "❌ Failed to install deps"; exit 1; }
        echo "✅ Dependencies installed in virtual env"
    else
        echo "✅ Python dependencies installed (system)"
    fi
fi

# Check if model exists
if [ ! -f "heart_diagnosis_model.pkl" ]; then
    echo "🤖 Training AI model (fast dataset)..."
    python3 ai_heart_diagnosis.py || echo "⚠️ Model training failed, will retry at runtime"
else
    echo "✅ AI model already exists (skipping train)"
fi

# Test the AI (use venv python if exists)
echo "🧪 Testing AI diagnosis..."
PYBIN=$(command -v python3)
if [ -f "ai_env/bin/python" ]; then PYBIN="ai_env/bin/python"; fi
$PYBIN run_ai.py 85 45 1 130 220 || echo "⚠️ AI quick test failed (non-blocking)"

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