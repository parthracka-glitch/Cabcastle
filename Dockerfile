# Multi-stage production Dockerfile for Cab Castle Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend TypeScript config and source files
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8000

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript output from builder
COPY --from=builder /app/dist ./dist

# Create non-root system user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/api/health || exit 1

CMD ["node", "dist/server.js"]
