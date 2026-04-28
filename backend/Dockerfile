# =============================================================================
#  SeleEvent — Golang Backend Docker Image for Cloud Run
#
#  PostgreSQL-only build (no CGO required)
#
#  Build:  docker build -f backend/Dockerfile -t seleevent-api ./backend
#  Run:    docker run -p 8080:8080 seleevent-api
# =============================================================================

# ── Build stage ─────────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static binary (CGO_ENABLED=0 — PostgreSQL pure Go driver, no CGO needed)
RUN CGO_ENABLED=0 go build \
  -ldflags="-s -w" \
  -o /seleevent-api \
  ./cmd/server

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM alpine:3.19

# Install runtime dependencies
# - ca-certificates: TLS connections (database, external APIs)
# - tzdata: timezone support
# - libc6-compat: glibc compatibility layer
RUN apk --no-cache add \
  ca-certificates \
  tzdata \
  libc6-compat

# Set timezone
ENV TZ=Asia/Jakarta

# Create non-root user for security (Cloud Run best practice)
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 -G appuser appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=appuser:appuser /seleevent-api /app/seleevent-api

# NOTE: Do NOT copy .env in production. Environment variables are injected
# via Cloud Run --set-env-vars and --set-secrets.
# For local development, mount .env:  -v ./backend/.env:/app/.env

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the API server
ENTRYPOINT ["/app/seleevent-api"]
