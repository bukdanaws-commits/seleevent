#!/bin/bash
# =============================================================================
#  SeleEvent — Cloud SQL Database Setup Script
#
#  Run this from Google Cloud Shell:
#    ./gcp/setup-database.sh
#
#  This script will:
#    1. Connect to Cloud SQL as postgres admin
#    2. Create the "eventku" database and user
#    3. Update the database-password secret in Secret Manager
# =============================================================================

set -euo pipefail

PROJECT_ID="eventku-494416"
REGION="asia-southeast2"
INSTANCE_NAME="eventku"
DB_USER="eventku"
DB_NAME="eventku"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $*"; }

# ── Generate or get password ─────────────────────────────────────────────────
info "Setting up database: $DB_NAME with user: $DB_USER"

# Prompt for password
read -rsp "Enter password for '$DB_USER' (or press Enter to generate one): " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
  info "Generated password: $DB_PASSWORD"
  info "⚠️  Save this password! It will also be stored in Secret Manager."
fi

# ── Create SQL commands ──────────────────────────────────────────────────────
SQL_SCRIPT=$(cat <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\echo ✅ Database setup complete!
\q
EOF
)

# ── Run via Cloud SQL Admin API ──────────────────────────────────────────────
info "Connecting to Cloud SQL instance: $INSTANCE_NAME"

# Use gcloud sql connect with the SQL piped in
# Note: This uses the Cloud SQL Proxy which requires interactive terminal
# If this doesn't work, we'll use the Admin API instead

echo "$SQL_SCRIPT" | gcloud sql connect $INSTANCE_NAME --user=postgres --database=postgres --quiet

# ── Update Secret Manager ────────────────────────────────────────────────────
info "Updating database-password secret in Secret Manager..."

if gcloud secrets describe database-password --project=$PROJECT_ID &>/dev/null; then
  echo -n "$DB_PASSWORD" | gcloud secrets versions add database-password --data-file=- --project=$PROJECT_ID
  info "Updated secret: database-password (new version added)"
else
  echo -n "$DB_PASSWORD" | gcloud secrets create database-password --data-file=- --replication-policy=automatic --project=$PROJECT_ID
  info "Created secret: database-password"
fi

info ""
info "Database setup complete!"
info "  Database: $DB_NAME"
info "  User: $DB_USER"
info "  Password: stored in Secret Manager as 'database-password'"
info ""
info "You can now run: ./gcp/deploy-from-cloudshell.sh"
