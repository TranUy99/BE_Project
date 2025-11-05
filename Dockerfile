# Dockerfile for Render deployment
FROM python:3.11-slim

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY ai_heart_diagnosis.py .
COPY run_ai.py .
COPY heart.csv .
COPY setup_ai.sh .

# Make setup script executable
RUN chmod +x setup_ai.sh

# Train AI model during build
RUN python3 ai_heart_diagnosis.py

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/heartrate/history?userId=test || exit 1

# Start the application
CMD ["npm", "start"]