# Use official lightweight Python image
FROM python:3.11-slim as builder

# Set env variables for optimization
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Final Stage
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

# Copy the orchestrator and agent code
# Note: Build context should be the repository root
# Build with: docker build -f services/orchestrator/Dockerfile .
COPY services/orchestrator ./services/orchestrator
COPY services/agents ./services/agents

# Create a non-root user for security (Google Best Practice)
RUN adduser --disabled-password --gecos '' infinity && \
    chown -R infinity:infinity /app
USER infinity

# Expose port
EXPOSE 8000

# Run via Uvicorn (ASGI Server)
CMD ["uvicorn", "services.orchestrator.main:app", "--host", "0.0.0.0", "--port", "8000"]
