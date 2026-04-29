#!/bin/bash
# =============================================================================
#  SeleEvent — One-Command Cloud Run Deployment
#
#  Supports two environments:
#    staging     → Midtrans SANDBOX keys
#    production  → Midtrans PRODUCTION keys (uang nyata!)
#
#  Run from Google Cloud Shell:
#    https://console.cloud.google.com/cloudshell?project=eventku-494416
#
#  Usage:
#    git clone https://github.com/bukdanaws-commits/seleevent.git
#    cd seleevent
#    chmod +x gcp/deploy-from-cloudshell.sh
#
#    # Set your secrets first:
#    source ~/.seleevent-env
#
#    # Deploy STAGING (sandbox Midtrans):
#    ./gcp/deploy-from-cloudshell.sh staging
#
#    # Deploy PRODUCTION (real Midtrans):
#    ./gcp/deploy-from-cloudshell.sh production
# =============================================================================

set -euo pipefail

# ── Determine environment ────────────────────────────────────────────────────
DEPLOY_ENV="${1:-staging}"

if [ "$DEPLOY_ENV" != "staging" ] && [ "$DEPLOY_ENV" != "production" ]; then
  echo "❌ Usage: $0 [staging|production]"
  echo ""
  echo "  staging    — Midtrans Sandbox (testing, bukan uang nyata)"
  echo "  production — Midtrans Production (PEMBAYARAN NYATA!)"
  exit 1
fi

# ── Configuration ────────────────────────────────────────────────────────────
PROJECT_ID="eventku-494416"
REGION="asia-southeast2"
INSTANCE_NAME="eventku"
REPO="eventku"
SA="eventku-sa@${PROJECT_ID}.iam.gserviceaccount.com"
BUCKET="eventku_data"

# Service names based on environment
if [ "$DEPLOY_ENV" = "production" ]; then
  API_SERVICE="eventku-api"
  WEB_SERVICE="eventku-web"
else
  API_SERVICE="eventku-api-staging"
  WEB_SERVICE="eventku-web-staging"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
if [ "$DEPLOY_ENV" = "production" ]; then
  echo -e "${RED}🔴  SELEEVENT — PRODUCTION DEPLOYMENT  🔴${NC}"
  echo -e "${RED}   Midtrans: PRODUCTION (UANG NYATA!)${NC}"
else
  echo -e "${BLUE}🧪  SELEEVENT — STAGING DEPLOYMENT  🧪${NC}"
  echo -e "${BLUE}   Midtrans: SANDBOX (testing only)${NC}"
fi
echo "============================================================"
echo "  API Service:   $API_SERVICE"
echo "  Web Service:   $WEB_SERVICE"
echo "  Project:       $PROJECT_ID"
echo "  Region:        $REGION"
echo ""

# ── Confirm production deployment ───────────────────────────────────────────
if [ "$DEPLOY_ENV" = "production" ]; then
  read -p "⚠️  Anda yakin deploy PRODUCTION? (ketik 'PRODUCTION'): " CONFIRM
  if [ "$CONFIRM" != "PRODUCTION" ]; then
    echo "Dibatalkan."
    exit 0
  fi
fi

# ── Get secrets from env vars ───────────────────────────────────────────────
get_secret() {
  local name="$1"
  local prompt="$2"
  local env_var="$3"
  
  local val="${!env_var:-}"
  if [ -n "$val" ]; then
    echo "$val"
    return
  fi
  
  read -rsp "$prompt: " val
  echo ""
  echo "$val"
}

info "Collecting secrets..."
DB_PASSWORD=$(get_secret "DB_PASSWORD" "Enter database password" "DB_PASSWORD")
GOOGLE_CLIENT_ID=$(get_secret "GOOGLE_CLIENT_ID" "Enter Google OAuth Client ID" "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_secret "GOOGLE_CLIENT_SECRET" "Enter Google OAuth Client Secret" "GOOGLE_CLIENT_SECRET")

# Select Midtrans keys based on environment
if [ "$DEPLOY_ENV" = "production" ]; then
  MIDTRANS_SERVER_KEY=$(get_secret "MIDTRANS_PRODUCTION_SERVER_KEY" "Enter Midtrans PRODUCTION Server Key" "MIDTRANS_PRODUCTION_SERVER_KEY")
  MIDTRANS_CLIENT_KEY=$(get_secret "MIDTRANS_PRODUCTION_CLIENT_KEY" "Enter Midtrans PRODUCTION Client Key" "MIDTRANS_PRODUCTION_CLIENT_KEY")
  MIDTRANS_MERCHANT_ID=$(get_secret "MIDTRANS_MERCHANT_ID" "Enter Midtrans Merchant ID" "MIDTRANS_MERCHANT_ID")
else
  MIDTRANS_SERVER_KEY=$(get_secret "MIDTRANS_SERVER_KEY" "Enter Midtrans SANDBOX Server Key" "MIDTRANS_SERVER_KEY")
  MIDTRANS_CLIENT_KEY=$(get_secret "MIDTRANS_CLIENT_KEY" "Enter Midtrans SANDBOX Client Key" "MIDTRANS_CLIENT_KEY")
  MIDTRANS_MERCHANT_ID=$(get_secret "MIDTRANS_MERCHANT_ID" "Enter Midtrans Merchant ID" "MIDTRANS_MERCHANT_ID")
fi

# ── Pre-flight checks ───────────────────────────────────────────────────────
info "Running pre-flight checks..."

gcloud config set project $PROJECT_ID 2>/dev/null
gcloud config set compute/region $REGION 2>/dev/null
gcloud config set run/region $REGION 2>/dev/null

ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
if [ -z "$ACCOUNT" ]; then
  error "No active gcloud account. Run: gcloud auth login"
fi
info "Authenticated as: $ACCOUNT"

# ── 1. Enable required APIs ─────────────────────────────────────────────────
info "Enabling required APIs..."
gcloud services enable --project=$PROJECT_ID \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  --quiet

# ── 2. Create service account (if not exists) ───────────────────────────────
info "Checking service account..."
if ! gcloud iam service-accounts describe $SA --project=$PROJECT_ID &>/dev/null; then
  info "Creating service account: $SA"
  gcloud iam service-accounts create eventku-sa \
    --display-name="EVENTKU Cloud Run Service Account" \
    --project=$PROJECT_ID
fi

# Grant roles to SA
info "Granting roles to service account..."
for ROLE in secretmanager.secretAccessor cloudsql.client storage.objectAdmin run.invoker; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA" \
    --role="roles/$ROLE" \
    --quiet 2>/dev/null || true
done

# ── 3. Create/update secrets ────────────────────────────────────────────────
info "Creating secrets..."

create_secret() {
  local name="$1"
  local value="$2"
  
  if [ -z "$value" ]; then
    warn "  Secret '$name' is empty — skipping!"
    return
  fi
  
  if gcloud secrets describe $name --project=$PROJECT_ID &>/dev/null; then
    info "  Secret '$name' exists, adding new version..."
  else
    info "  Creating secret '$name'..."
    gcloud secrets create $name --replication-policy=automatic --project=$PROJECT_ID
  fi
  
  echo -n "$value" | gcloud secrets versions add $name --data-file=- --project=$PROJECT_ID
}

# Use environment-specific secret names for staging vs production
if [ "$DEPLOY_ENV" = "production" ]; then
  SECRET_PREFIX="prod"
else
  SECRET_PREFIX="staging"
fi

create_secret "database-password" "$DB_PASSWORD"
create_secret "jwt-secret" "$(openssl rand -base64 32)"
create_secret "refresh-jwt-secret" "$(openssl rand -base64 32)"
create_secret "google-client-id" "$GOOGLE_CLIENT_ID"
create_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"
create_secret "midtrans-merchant-id" "$MIDTRANS_MERCHANT_ID"
create_secret "midtrans-server-key" "$MIDTRANS_SERVER_KEY"
create_secret "midtrans-client-key" "$MIDTRANS_CLIENT_KEY"

# ── 4. Create Artifact Registry repository ───────────────────────────────────
info "Checking Artifact Registry repository..."
if ! gcloud artifacts repositories describe $REPO --location=$REGION --project=$PROJECT_ID &>/dev/null; then
  info "Creating Artifact Registry repository..."
  gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$REGION \
    --project=$PROJECT_ID
fi

# ── 5. Grant Cloud Build permissions ────────────────────────────────────────
info "Granting Cloud Build permissions..."
PROJECT_NUM=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUM}-compute@developer.gserviceaccount.com"

for ROLE in run.admin storage.admin artifactregistry.writer secretmanager.secretAccessor cloudsql.client iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/$ROLE" \
    --quiet 2>/dev/null || true
done

# Grant actAs on eventku-sa
gcloud iam service-accounts add-iam-policy-binding $SA \
  --member="serviceAccount:$COMPUTE_SA" \
  --role="roles/iam.serviceAccountUser" \
  --quiet 2>/dev/null || true

# ── 6. Configure GCS bucket ────────────────────────────────────────────────
info "Configuring GCS bucket..."

cat > /tmp/cors.json << 'EOF'
[{"origin":["*"],"method":["GET","HEAD","PUT","POST","DELETE"],"responseHeader":["Content-Type","Authorization","X-Goog-Content-Range"],"maxAgeSeconds":3600}]
EOF
gcloud storage buckets update gs://$BUCKET --cors-file=/tmp/cors.json 2>/dev/null || true
gcloud storage buckets update gs://$BUCKET --no-public-access-prevention 2>/dev/null || true
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=allUsers --role=roles/storage.objectViewer \
  --quiet 2>/dev/null || true
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member="serviceAccount:$SA" --role=roles/storage.admin \
  --quiet 2>/dev/null || true

# ── 7. Setup Cloud SQL Database ─────────────────────────────────────────────
info "Setting up Cloud SQL database..."

DB_EXISTS=$(gcloud sql databases list --instance=$INSTANCE_NAME --project=$PROJECT_ID --format="value(name)" 2>/dev/null | grep -c "^eventku$" || true)

if [ "$DB_EXISTS" -eq 0 ]; then
  info "Creating database 'eventku'..."
  gcloud sql databases create eventku --instance=$INSTANCE_NAME --project=$PROJECT_ID
else
  info "Database 'eventku' already exists"
fi

USER_EXISTS=$(gcloud sql users list --instance=$INSTANCE_NAME --project=$PROJECT_ID --format="value(name)" 2>/dev/null | grep -c "^eventku$" || true)

if [ "$USER_EXISTS" -eq 0 ]; then
  info "Creating database user 'eventku'..."
  gcloud sql users create eventku --instance=$INSTANCE_NAME --project=$PROJECT_ID --password="$DB_PASSWORD"
else
  info "User 'eventku' already exists, updating password..."
  gcloud sql users set-password eventku --instance=$INSTANCE_NAME --project=$PROJECT_ID --password="$DB_PASSWORD" --host=%
fi

info "Database setup complete!"

# ── 8. Build & Deploy Backend ───────────────────────────────────────────────
info "Building and deploying backend ($API_SERVICE)..."
SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
info "Building image with tag: $SHORT_SHA"

# Determine Midtrans sandbox flag
if [ "$DEPLOY_ENV" = "production" ]; then
  MIDTRANS_IS_SANDBOX="false"
else
  MIDTRANS_IS_SANDBOX="true"
fi

gcloud builds submit . \
  --config=gcp/cloudbuild-backend.yaml \
  --substitutions=_REGION=$REGION,_INSTANCE_NAME=$INSTANCE_NAME,_REPO=$REPO,_COMMIT_SHA=$SHORT_SHA,_DEPLOY_ENV=$DEPLOY_ENV \
  --project=$PROJECT_ID \
  --timeout=1200s

info "Backend deployed: $API_SERVICE"

# ── 9. Get Backend URL ──────────────────────────────────────────────────────
BACKEND_URL=$(gcloud run services describe $API_SERVICE \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

info "Backend URL: $BACKEND_URL"

# ── 10. Build & Deploy Frontend ─────────────────────────────────────────────
info "Building and deploying frontend ($WEB_SERVICE)..."

gcloud builds submit . \
  --config=gcp/cloudbuild-frontend.yaml \
  --substitutions=_REGION=$REGION,_REPO=$REPO,_BACKEND_URL=$BACKEND_URL,_MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY,_MIDTRANS_IS_SANDBOX=$MIDTRANS_IS_SANDBOX,_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,_COMMIT_SHA=$SHORT_SHA,_DEPLOY_ENV=$DEPLOY_ENV \
  --project=$PROJECT_ID \
  --timeout=1800s

info "Frontend deployed: $WEB_SERVICE"

# ── 11. Get Frontend URL ────────────────────────────────────────────────────
FRONTEND_URL=$(gcloud run services describe $WEB_SERVICE \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

# ── Done! ────────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
if [ "$DEPLOY_ENV" = "production" ]; then
  echo -e "${GREEN}🎉 PRODUCTION Deployment Complete! 🔴${NC}"
else
  echo -e "${GREEN}🎉 STAGING Deployment Complete! 🧪${NC}"
fi
echo "============================================================"
echo ""
echo "  Environment:  $DEPLOY_ENV"
echo "  Midtrans:     $([ "$DEPLOY_ENV" = "production" ] && echo "PRODUCTION 💰" || echo "SANDBOX 🧪")"
echo ""
echo "  Backend API:  $BACKEND_URL"
echo "  Frontend Web: $FRONTEND_URL"
echo ""
echo "  Cloud SQL:    $INSTANCE_NAME ($REGION)"
echo "  GCS Bucket:   gs://$BUCKET"
echo ""
echo -e "  ${YELLOW}Next steps:${NC}"
echo "    1. Seed database with demo data:"
echo "       gcloud sql connect $INSTANCE_NAME --user=eventku --database=eventku < backend/database/seed-data.sql"
echo ""
echo "    2. Or test the health endpoint:"
echo "       curl $BACKEND_URL/health"
echo ""
echo "    3. Set up custom domain in Cloud Run"
echo ""
echo "    4. Configure Midtrans payment webhook URL:"
echo "       $BACKEND_URL/api/v1/payment/notification"
echo ""
if [ "$DEPLOY_ENV" = "production" ]; then
  echo -e "  ${RED}⚠️  PRODUCTION: Midtrans menggunakan key PRODUCTION!${NC}"
  echo -e "  ${RED}   Semua transaksi adalah PEMBAYARAN NYATA!${NC}"
  echo ""
fi
