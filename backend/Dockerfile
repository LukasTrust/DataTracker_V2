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
    chown -R appuser:appuser /app || true

# Python Dependencies aus Builder-Stage kopieren
# Install into root user site so binaries are available when running as root
COPY --from=builder /root/.local /root/.local

# Backend-Code kopieren (do not force ownership here because a named volume
# mounted at /app/data may override ownership at runtime)
COPY . /app/backend/

# Note: we intentionally do not switch to the non-root user here. This lets
# the container perform a chown on the mounted volume at startup so SQLite can
# create the database file even when the volume's ownership would otherwise
# prevent writes. This is a pragmatic fix for permission issues with named
# volumes. For stricter setups, consider using an init script that drops
# privileges after adjusting ownership.

# Python Path anpassen
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Port exponieren (intern)
EXPOSE 8000

# Health Check Endpoint - verwende curl statt Python requests
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)" || exit 1

# Datenbank initialisieren und Server starten
CMD ["sh", "-c", "chown -R appuser:appuser /app/data || true; cd /app && python -m backend.migrate && uvicorn backend.main:app --host 0.0.0.0 --port 8000"]
