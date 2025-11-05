# Dockerfile for Render deployment
FROM node:20-bullseye-slim

# Install Python and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip python3-dev build-essential curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests and setup script early so postinstall can access it
COPY package.json package-lock.json setup_ai.sh requirements.txt ./

# Ensure setup script is executable before npm triggers postinstall
RUN chmod +x setup_ai.sh

# Install Node dependencies (use ci if lockfile present)
RUN npm ci --omit=dev || npm install --production

# Install Python dependencies (in system, small set) and train model
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application source (excluding setup script already copied)
COPY src/ ./src/
COPY ai_heart_diagnosis.py run_ai.py heart.csv ./

# Train AI model (dataset nhỏ nên OK). If fail, build continues.
RUN chmod +x setup_ai.sh && python3 ai_heart_diagnosis.py || echo "⚠️ Model training failed during build, will train at runtime"

# Environment
ENV NODE_ENV=production

EXPOSE 3000

# Health check (Render/Railway may ignore in Docker but kept for portability)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/heartrate/history?userId=test || exit 1

# Start server
CMD ["node", "src/server.js"]