# Multi-stage production Dockerfile for DriveHub Goa Express TypeScript Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript to dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Create non-root system user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/api/healthz || exit 1

CMD ["node", "dist/server.js"]
