#!/bin/bash
# =============================================================================
#  SeleEvent — Database Seed Loader
#
#  Loads schema.sql + seed-data.sql into Cloud SQL.
#  Fixes the issue where `gcloud sql connect ... < file.sql` fails
#  because the interactive password prompt consumes stdin.
#
#  Usage (from Cloud Shell):
#    cd seleevent
#    chmod +x gcp/seed-database.sh
#    ./gcp/seed-database.sh
#
#  Or with explicit password:
#    DB_PASSWORD=your_password ./gcp/seed-database.sh
# =============================================================================

set -euo pipefail

PROJECT_ID="eventku-494416"
REGION="asia-southeast2"
INSTANCE_NAME="eventku"
DB_USER="eventku"
DB_NAME="eventku"
DB_PORT=5433

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Load secrets ──────────────────────────────────────────────────────────────
SECRETS_FILE="$HOME/.seleevent-env"
if [ -f "$SECRETS_FILE" ]; then
  source "$SECRETS_FILE"
  info "Loaded secrets from $SECRETS_FILE"
fi

# Get DB password
if [ -z "${DB_PASSWORD:-}" ]; then
  read -rsp "Enter database password: " DB_PASSWORD
  echo ""
fi

if [ -z "$DB_PASSWORD" ]; then
  error "Database password is required"
fi

# ── Determine which files to load ─────────────────────────────────────────────
SCHEMA_FILE="backend/database/schema.sql"
SEED_FILE="backend/database/seed-data.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  error "Schema file not found: $SCHEMA_FILE"
fi
if [ ! -f "$SEED_FILE" ]; then
  error "Seed file not found: $SEED_FILE"
fi

MODE="${1:-full}"
if [ "$MODE" != "full" ] && [ "$MODE" != "seed-only" ]; then
  echo "Usage: $0 [full|seed-only]"
  echo ""
  echo "  full       — Load schema.sql + seed-data.sql (default)"
  echo "  seed-only  — Load seed-data.sql only (schema already exists)"
  exit 1
fi

# ── Method 1: Try using cloud-sql-proxy + psql (recommended) ─────────────────
info "Connecting to Cloud SQL instance: $INSTANCE_NAME"

# Check if cloud-sql-proxy is available
if command -v cloud-sql-proxy &>/dev/null; then
  info "Using cloud-sql-proxy method..."

  # Kill any existing proxy on our port
  lsof -ti:$DB_PORT 2>/dev/null | xargs kill 2>/dev/null || true

  # Start cloud-sql-proxy in background
  info "Starting Cloud SQL Proxy on port $DB_PORT..."
  cloud-sql-proxy "$PROJECT_ID:$REGION:$INSTANCE_NAME" --port=$DB_PORT &
  PROXY_PID=$!

  # Wait for proxy to be ready
  info "Waiting for proxy to start..."
  for i in $(seq 1 15); do
    if PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" &>/dev/null; then
      info "Proxy is ready!"
      break
    fi
    if [ $i -eq 15 ]; then
      kill $PROXY_PID 2>/dev/null || true
      error "Cloud SQL Proxy failed to start or connection timed out"
    fi
    sleep 2
  done

  # Load schema if requested
  if [ "$MODE" = "full" ]; then
    info "Loading schema.sql..."
    PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCHEMA_FILE"
    info "Schema loaded successfully!"
  fi

  # Load seed data
  info "Loading seed-data.sql..."
  PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SEED_FILE"
  info "Seed data loaded successfully!"

  # Stop the proxy
  kill $PROXY_PID 2>/dev/null || true
  info "Cloud SQL Proxy stopped."

# ── Method 2: Fallback — use gcloud sql connect interactively ─────────────────
else
  warn "cloud-sql-proxy not found. Using gcloud sql connect method."
  warn "This method requires you to type the password manually."
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo -e "${YELLOW}INSTRUCTIONS:${NC}"
  echo ""
  echo "1. Run this command to connect:"
  echo "   gcloud sql connect $INSTANCE_NAME --user=$DB_USER --database=$DB_NAME"
  echo ""
  echo "2. Type the password when prompted"
  echo ""
  echo "3. In the psql prompt, run:"
  if [ "$MODE" = "full" ]; then
    echo "   \\i $SCHEMA_FILE"
  fi
  echo "   \\i $SEED_FILE"
  echo "   \\q"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  read -p "Press Enter to open the connection now (or Ctrl+C to cancel)..."
  gcloud sql connect $INSTANCE_NAME --user=$DB_USER --database=$DB_NAME
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo -e "${GREEN}✅ Database seeding complete!${NC}"
echo "============================================================"
echo ""
echo "Verify with:"
echo "  gcloud sql connect $INSTANCE_NAME --user=$DB_USER --database=$DB_NAME"
echo "  SELECT count(*) FROM events;"
echo "  SELECT count(*) FROM orders;"
echo "  SELECT count(*) FROM tickets;"
