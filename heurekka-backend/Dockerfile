# Multi-stage build for Heurekka Backend
# Based on Node.js with TypeScript support for tRPC API and WebSocket server

# ==========================================
# Stage 1: Build stage
# ==========================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with clean npm cache
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript application
RUN npm run build

# ==========================================
# Stage 2: Production stage
# ==========================================
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Install runtime dependencies only
RUN apk add --no-cache \
    dumb-init \
    tini

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package*.json ./

# Copy public assets if they exist (optional)
# COPY --from=builder --chown=backend:nodejs /app/public/ ./public/

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    WS_PORT=3001 \
    HOST=0.0.0.0

# Expose ports
# Port 3001 for HTTP API and WebSocket server
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node dist/healthcheck.js || exit 1

# Switch to non-root user
USER backend

# Use tini as init system for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# ==========================================
# Development stage (for docker-compose)
# ==========================================
FROM node:20-alpine AS development

# Install development dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm install

# Expose development ports
EXPOSE 3001

# Volume mount for hot reloading in development
VOLUME ["/app/src", "/app/public"]

# Development command with hot reload
CMD ["npm", "run", "dev"]