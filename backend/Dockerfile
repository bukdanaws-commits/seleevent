# =============================================================================
#  EVENTKU — Golang Backend Docker Image for Cloud Run
#
#  Multi-stage build supporting both SQLite (development) and PostgreSQL (production)
#
#  Development:  CGO_ENABLED=1 (for SQLite/mattn-go-sqlite3)
#  Production:   CGO_ENABLED=0 (static binary, PostgreSQL via lib/pq)
#
#  Build:  docker build -f backend/Dockerfile -t eventku-api ./backend
#  Run:    docker run -p 8080:8080 eventku-api
# =============================================================================

# ── Build stage ─────────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS builder

# Install build dependencies (gcc + musl-dev for CGO when using SQLite)
# PostgreSQL pure Go driver (lib/pq) does NOT need CGO, but we keep it
# available for dev builds that may use SQLite.
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
# - CGO_ENABLED=0 for static binary (works with PostgreSQL driver)
# - Use CGO_ENABLED=1 for SQLite support (remove for pure PostgreSQL)
# - ldflags: strip debug info, reduce binary size
ARG CGO_ENABLED=0
RUN CGO_ENABLED=${CGO_ENABLED} go build \
  -ldflags="-s -w" \
  -o /eventku-api \
  ./cmd/server

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM alpine:3.19

# Install runtime dependencies
# - ca-certificates: TLS connections (database, external APIs)
# - tzdata: timezone support
# - sqlite-libs: SQLite support (dev mode)
# - libc6-compat: glibc compatibility layer
RUN apk --no-cache add \
  ca-certificates \
  tzdata \
  sqlite-libs \
  libc6-compat

# Set timezone
ENV TZ=Asia/Jakarta

# Create non-root user for security (Cloud Run best practice)
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 -G appuser appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=appuser:appuser /eventku-api /app/eventku-api

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
ENTRYPOINT ["/app/eventku-api"]
