# =============================================================================
#  SeleEvent — Golang Backend Docker Image for Cloud Run
#
#  PostgreSQL-only build (no CGO required)
#
#  Two build strategies supported:
#
#  1. Local build (builds from source inside Docker):
#     docker build -f backend/Dockerfile -t seleevent-api ./backend
#
#  2. Cloud Build (uses pre-built binary for faster CI):
#     docker build -f backend/Dockerfile
#       --build-arg=BINARY_PATH=/workspace/eventku-api
#       -t seleevent-api .
#
#  Run:  docker run -p 8080:8080 seleevent-api
# =============================================================================

# ── Build stage ─────────────────────────────────────────────────────────────
# If BINARY_PATH is provided (Cloud Build), skip Go compilation and use the
# pre-built binary. Otherwise, build from source inside Docker.
FROM golang:1.24-alpine AS builder

ARG BINARY_PATH=""

WORKDIR /app

RUN if [ -z "$BINARY_PATH" ]; then \
      echo "🔨 Building from source inside Docker..."; \
    else \
      echo "📦 Using pre-built binary from Cloud Build: ${BINARY_PATH}"; \
    fi

# Conditional: only copy source + build if no pre-built binary provided
COPY go.mod go.sum ./
RUN if [ -z "$BINARY_PATH" ]; then go mod download; fi

COPY . .

RUN if [ -z "$BINARY_PATH" ]; then \
      CGO_ENABLED=0 go build \
        -ldflags="-s -w" \
        -o /seleevent-api \
        ./cmd/server; \
    else \
      cp /workspace/eventku-api /seleevent-api; \
    fi

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM alpine:3.19

# Install runtime dependencies
# - ca-certificates: TLS connections (database, external APIs)
# - tzdata: timezone support
# NOTE: libc6-compat removed — not needed for CGO_ENABLED=0 pure Go binary
RUN apk --no-cache add \
  ca-certificates \
  tzdata

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

# Expose port (Cloud Run injects PORT env var, default is 8080)
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the API server
ENTRYPOINT ["/app/seleevent-api"]
