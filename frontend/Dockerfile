# =============================================================================
# DataTracker V2 - Frontend Dockerfile
# =============================================================================
# Multi-stage Build für optimale Image-Größe
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine as builder

WORKDIR /app

# Package-Dateien kopieren und Dependencies installieren
COPY package*.json ./
# npm v9+ supports --include=dev to explicitly include devDependencies during install
RUN npm ci --include=dev

# Source-Code kopieren und Build durchführen
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Runtime mit Nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Nginx-Konfiguration kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build-Artefakte aus Builder-Stage kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root User für Nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# User wechseln
USER nginx

# Port exponieren
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]
