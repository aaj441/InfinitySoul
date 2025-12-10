# InfinitySoulAIS Dockerfile v1.2.0
# Multi-stage build for backend service

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS dependencies
WORKDIR /app/InfinitySoul-AIS/backend
COPY InfinitySoul-AIS/backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
WORKDIR /app/InfinitySoul-AIS
COPY InfinitySoul-AIS ./
WORKDIR /app/InfinitySoul-AIS/backend
RUN npm ci

# Production stage
FROM base AS production
WORKDIR /app/InfinitySoul-AIS

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/InfinitySoul-AIS/backend/node_modules ./backend/node_modules
# Copy application files
COPY InfinitySoul-AIS/backend ./backend/
COPY InfinitySoul-AIS/api ./api/
COPY InfinitySoul-AIS/modules ./modules/
COPY InfinitySoul-AIS/scoring ./scoring/
COPY InfinitySoul-AIS/vault ./vault/
COPY InfinitySoul-AIS/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

WORKDIR /app/InfinitySoul-AIS/backend
CMD ["node", "index.js"]
