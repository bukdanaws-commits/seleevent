# =============================================================================
#  SeleEvent — Golang Backend Docker Image for Cloud Run
#
#  Two build strategies:
#
#  1. Local build (from backend/ directory):
#     docker build -t seleevent-api .
#
#  2. Cloud Build (from project root with pre-built binary):
#     docker build -f backend/Dockerfile --build-arg=BINARY_PATH=backend/eventku-api -t seleevent-api .
#
#  Run:  docker run -p 8080:8080 seleevent-api
# =============================================================================

# ── Build stage ─────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

ARG BINARY_PATH=""

WORKDIR /app

RUN if [ -z "$BINARY_PATH" ]; then \
      echo "Building from source inside Docker..."; \
    else \
      echo "Using pre-built binary: ${BINARY_PATH}"; \
    fi

# Only copy source + build if no pre-built binary provided
COPY go.mod go.sum ./
RUN if [ -z "$BINARY_PATH" ]; then go mod download; fi

COPY . .

RUN if [ -z "$BINARY_PATH" ]; then \
      go mod tidy && \
      CGO_ENABLED=0 go build \
        -ldflags="-s -w" \
        -o /seleevent-api \
        ./cmd/server; \
    else \
      cp ${BINARY_PATH} /seleevent-api; \
    fi

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM alpine:3.19

RUN apk --no-cache add \
  ca-certificates \
  tzdata

ENV TZ=Asia/Jakarta

RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 -G appuser appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /seleevent-api /app/seleevent-api

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["/app/seleevent-api"]
