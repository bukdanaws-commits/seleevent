#!/bin/bash
# =============================================================
#  EVENTKU — GCP Infrastructure Setup Script
#
#  Usage:   ./gcp/setup.sh <PROJECT_ID> [REGION]
#  Example: ./gcp/setup.sh eventku-494416 asia-southeast2
#
#  Prerequisites:
#    - gcloud CLI installed and authenticated
#    - GCP project already created
#    - (Optional) Cloud SQL instance already created — script will detect
#
#  Environment variables (optional, will prompt if not set):
#    GOOGLE_CLIENT_ID       — Google OAuth Client ID
#    GOOGLE_CLIENT_SECRET   — Google OAuth Client Secret
#    MIDTRANS_MERCHANT_ID   — Midtrans Merchant ID
#    MIDTRANS_SERVER_KEY    — Midtrans Server Key
#    MIDTRANS_CLIENT_KEY    — Midtrans Client Key
# =============================================================

set -euo pipefail

PROJECT_ID=${1:?Error: PROJECT_ID required. Usage: ./setup.sh <PROJECT_ID> [REGION]}
REGION=${2:-asia-southeast2}

echo "================================================"
echo "  EVENTKU — GCP INFRASTRUCTURE SETUP"
echo "  Project: $PROJECT_ID"
echo "  Region:  $REGION (Jakarta)"
echo "================================================"

# ── Step 1: Set project ──────────────────────────────────
echo ""
echo "▸ [1/11] Setting project..."
gcloud config set project "$PROJECT_ID"

# ── Step 2: Enable required APIs ────────────────────────
echo ""
echo "▸ [2/11] Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  sql-component.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  dns.googleapis.com \
  compute.googleapis.com \
  servicenetworking.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  --project="$PROJECT_ID"
echo "  ✅  All APIs enabled"

# ── Step 3: Create Service Account ──────────────────────
echo ""
echo "▸ [3/11] Creating service account..."
SA_NAME="eventku-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create "$SA_NAME" \
  --display-name="EVENTKU Cloud Run Service Account" \
  --project="$PROJECT_ID" 2>/dev/null || echo "  ℹ️  Service account already exists, skipping creation."
echo "  ✅  $SA_EMAIL"

# ── Step 4: Grant IAM roles ─────────────────────────────
echo ""
echo "▸ [4/11] Granting IAM roles to $SA_EMAIL..."
for ROLE in \
  "roles/cloudsql.client" \
  "roles/secretmanager.secretAccessor" \
  "roles/storage.objectViewer" \
  "roles/storage.objectCreator" \
  "roles/logging.logWriter" \
  "roles/monitoring.metricWriter" \
  "roles/errorreporting.writer"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" --condition=None --quiet > /dev/null
  echo "  ✅  $ROLE"
done

# ── Step 5: Verify / Create Cloud SQL instance ───────────
echo ""
echo "▸ [5/11] Verifying Cloud SQL instance..."
INSTANCE_NAME="eventku"

if gcloud sql instances describe "$INSTANCE_NAME" --project="$PROJECT_ID" > /dev/null 2>&1; then
  echo "  ✅  Cloud SQL instance '$INSTANCE_NAME' already exists — skipping creation."
  INSTANCE_CONNECTION="$(gcloud sql instances describe "$INSTANCE_NAME" \
    --project="$PROJECT_ID" --format='value(connectionName)')"
  PUBLIC_IP="$(gcloud sql instances describe "$INSTANCE_NAME" \
    --project="$PROJECT_ID" --format='value(ipAddresses[0].ipAddress)')"
  echo "  📡  Connection: $INSTANCE_CONNECTION"
  echo "  🌐  Public IP:  $PUBLIC_IP"
else
  echo "  ⚠️  Cloud SQL instance not found. Creating PostgreSQL 18..."
  gcloud sql instances create "$INSTANCE_NAME" \
    --database-version=POSTGRES_18 \
    --tier=db-custom-2-7680 \
    --region="$REGION" \
    --edition=ENTERPRISE \
    --availability-type=regional \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time=02:00 \
    --enable-point-in-time-recovery \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=03 \
    --database-flags=log_checkpoints=on,log_connections=on,log_disconnections=on \
    --project="$PROJECT_ID"
  echo "  ✅  Cloud SQL instance created."
fi

# ── Step 6: Create database (if not exists) ──────────────
echo ""
echo "▸ [6/11] Creating database..."
DB_NAME="eventku"
gcloud sql databases create "$DB_NAME" \
  --instance="$INSTANCE_NAME" \
  --project="$PROJECT_ID" 2>/dev/null || echo "  ℹ️  Database '$DB_NAME' already exists."

# ── Step 7: Create database user ────────────────────────
echo ""
echo "▸ [7/11] Setting up database user..."
DB_USER="eventku"
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)

# Try to create user; if exists, update password
gcloud sql users create "$DB_USER" \
  --instance="$INSTANCE_NAME" \
  --password="$DB_PASS" \
  --project="$PROJECT_ID" 2>/dev/null || {
  echo "  ℹ️  User '$DB_USER' already exists. Setting new password..."
  gcloud sql users set-password "$DB_USER" \
    --instance="$INSTANCE_NAME" \
    --password="$DB_PASS" \
    --project="$PROJECT_ID"
}

echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  ⚠️  SAVE THIS PASSWORD — YOU WON'T SEE IT AGAIN │"
echo "  │                                                   │"
echo "  │  DB User:     $DB_USER"
echo "  │  DB Password: $DB_PASS"
echo "  └─────────────────────────────────────────────────┘"

# ── Step 8: Store ALL 8 secrets in Secret Manager ───────
echo ""
echo "▸ [8/11] Storing secrets in Secret Manager..."

# Helper function: create secret or add new version
create_or_update_secret() {
  local name="$1"
  local value="$2"

  if gcloud secrets describe "$name" --project="$PROJECT_ID" > /dev/null 2>&1; then
    echo -n "$value" | gcloud secrets versions add "$name" \
      --data-file=- \
      --project="$PROJECT_ID" > /dev/null
    echo "  ✅  $name (version added)"
  else
    echo -n "$value" | gcloud secrets create "$name" \
      --data-file=- \
      --replication-policy=automatic \
      --project="$PROJECT_ID" > /dev/null
    echo "  ✅  $name (created)"
  fi
}

# --- Auto-generated secrets ---
create_or_update_secret "database-password" "$DB_PASS"

JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=')
create_or_update_secret "jwt-secret" "$JWT_SECRET"

REFRESH_JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=')
create_or_update_secret "refresh-jwt-secret" "$REFRESH_JWT_SECRET"

# --- External secrets (from env vars or interactive prompt) ---
# NOTE: These are NOT hardcoded for security. Set env vars or enter when prompted.
# Example: GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=xxx ./gcp/setup.sh eventku-494416

# Google OAuth
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-}"

if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo ""
  read -rp "  🔑 Enter GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
fi
create_or_update_secret "google-client-id" "$GOOGLE_CLIENT_ID"

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  read -rp "  🔑 Enter GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
fi
create_or_update_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"

# Midtrans
MIDTRANS_MERCHANT_ID="${MIDTRANS_MERCHANT_ID:-}"
MIDTRANS_SERVER_KEY="${MIDTRANS_SERVER_KEY:-}"
MIDTRANS_CLIENT_KEY="${MIDTRANS_CLIENT_KEY:-}"

if [ -z "$MIDTRANS_MERCHANT_ID" ]; then
  read -rp "  🔑 Enter MIDTRANS_MERCHANT_ID: " MIDTRANS_MERCHANT_ID
fi
create_or_update_secret "midtrans-merchant-id" "$MIDTRANS_MERCHANT_ID"

if [ -z "$MIDTRANS_SERVER_KEY" ]; then
  read -rp "  🔑 Enter MIDTRANS_SERVER_KEY: " MIDTRANS_SERVER_KEY
fi
create_or_update_secret "midtrans-server-key" "$MIDTRANS_SERVER_KEY"

if [ -z "$MIDTRANS_CLIENT_KEY" ]; then
  read -rp "  🔑 Enter MIDTRANS_CLIENT_KEY: " MIDTRANS_CLIENT_KEY
fi
create_or_update_secret "midtrans-client-key" "$MIDTRANS_CLIENT_KEY"

# ── Step 9: Grant SA access to ALL 8 secrets ─────────────
echo ""
echo "▸ [9/11] Granting service account access to secrets..."
for SECRET in database-password jwt-secret refresh-jwt-secret \
  google-client-id google-client-secret \
  midtrans-merchant-id midtrans-server-key midtrans-client-key; do
  gcloud secrets add-iam-policy-binding "$SECRET" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID" > /dev/null 2>/dev/null
  echo "  ✅  $SECRET"
done

# ── Step 10: Create Cloud Storage bucket ────────────────
echo ""
echo "▸ [10/11] Creating Cloud Storage bucket..."
BUCKET_NAME="${PROJECT_ID}-assets"
gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://${BUCKET_NAME}" 2>/dev/null || \
  echo "  ℹ️  Bucket already exists, skipping creation."

# Create folder structure
gsutil cp /dev/null "gs://${BUCKET_NAME}/qr-codes/.keep" 2>/dev/null || true
gsutil cp /dev/null "gs://${BUCKET_NAME}/event-images/.keep" 2>/dev/null || true
gsutil cp /dev/null "gs://${BUCKET_NAME}/exports/.keep" 2>/dev/null || true

# Make bucket publicly readable (for QR codes, event images)
gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}" 2>/dev/null || true
echo "  ✅  gs://${BUCKET_NAME}"

# ── Step 11: Create Artifact Registry + Cloud Build perms ─
echo ""
echo "▸ [11/11] Creating Artifact Registry & Cloud Build permissions..."

gcloud artifacts repositories create docker \
  --repository-format=docker \
  --location="$REGION" \
  --description="EVENTKU Docker images" \
  --project="$PROJECT_ID" 2>/dev/null || \
  echo "  ℹ️  Artifact Registry already exists, skipping creation."

echo "  ✅  ${REGION}-docker.pkg.dev/${PROJECT_ID}/docker"

# Grant Cloud Build service account roles
PROJECT_NUM=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")

for ROLE in \
  "roles/run.admin" \
  "roles/iam.serviceAccountUser" \
  "roles/cloudsql.client" \
  "roles/artifactregistry.writer" \
  "roles/secretmanager.secretAccessor"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${PROJECT_NUM}@cloudbuild.gserviceaccount.com" \
    --role="$ROLE" --condition=None --quiet > /dev/null
done
echo "  ✅  Cloud Build permissions configured"

# ── Output summary ──────────────────────────────────────
echo ""
echo "============================================================"
echo "  ✅  EVENTKU GCP SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "  PROJECT_ID:        $PROJECT_ID"
echo "  REGION:            $REGION (Jakarta)"
echo "  SERVICE ACCOUNT:   $SA_EMAIL"
echo ""
echo "  ┌─ Cloud SQL ─────────────────────────────────────┐"
echo "  │  Instance:    $INSTANCE_NAME"
echo "  │  Version:     PostgreSQL 18"
echo "  │  Database:    $DB_NAME"
echo "  │  User:        $DB_USER"
echo "  │  Password:    $DB_PASS"
echo "  │  Connection:  $PROJECT_ID:$REGION:$INSTANCE_NAME"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "  ┌─ Cloud Storage ────────────────────────────────┐"
echo "  │  Bucket:      gs://${BUCKET_NAME}"
echo "  │  Folders:     qr-codes/, event-images/, exports/"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "  ┌─ Artifact Registry ────────────────────────────┐"
echo "  │  Repository:  ${REGION}-docker.pkg.dev/${PROJECT_ID}/docker"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "  ┌─ Secret Manager (8 secrets) ───────────────────┐"
echo "  │  ✅ database-password     (auto-generated)"
echo "  │  ✅ jwt-secret            (auto-generated)"
echo "  │  ✅ refresh-jwt-secret    (auto-generated)"
echo "  │  ✅ google-client-id      (from input)"
echo "  │  ✅ google-client-secret  (from input)"
echo "  │  ✅ midtrans-merchant-id  (from input)"
echo "  │  ✅ midtrans-server-key   (from input)"
echo "  │  ✅ midtrans-client-key   (from input)"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "  ┌─ Next Steps ───────────────────────────────────┐"
echo "  │  1. Deploy backend:                             │"
echo "  │     ./gcp/deploy-backend.sh $PROJECT_ID $REGION"
echo "  │                                                  │"
echo "  │  2. Deploy frontend:                             │"
echo "  │     ./gcp/deploy-frontend.sh $PROJECT_ID $REGION <BACKEND_URL>"
echo "  │                                                  │"
echo "  │  3. Configure DNS: Add A record for domain       │"
echo "  └─────────────────────────────────────────────────┘"
echo "============================================================"
