# =============================================================================
# DataTracker V2 - Backend Dockerfile
# =============================================================================
# Multi-stage Build für optimale Image-Größe und Sicherheit
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM python:3.11-slim as builder

WORKDIR /app

# System-Dependencies für Python-Packages installieren
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python Dependencies installieren
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app/backend

# Non-root User erstellen für bessere Sicherheit
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/backend/data && \
    chown -R appuser:appuser /app

# Python Dependencies aus Builder-Stage kopieren
COPY --from=builder /root/.local /home/appuser/.local

# Backend-Code kopieren
COPY --chown=appuser:appuser . /app/backend/

# User wechseln
USER appuser

# Python Path anpassen
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app

# Port exponieren (intern)
EXPOSE 8000

# Health Check Endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)"

# Datenbank initialisieren und Server starten
CMD ["sh", "-c", "cd /app && python -m backend.migrate && uvicorn backend.main:app --host 0.0.0.0 --port 8000"]
