#!/bin/bash
# =============================================================================
#  SeleEvent — One-Command Cloud Run Deployment
#
#  Run this from Google Cloud Shell:
#    https://console.cloud.google.com/cloudshell?project=eventku-494416
#
#  Usage:
#    git clone https://github.com/bukdanaws-commits/seleevent.git
#    cd seleevent
#    chmod +x gcp/deploy-from-cloudshell.sh
#
#    # Set your secrets (or they will be prompted interactively)
#    export DB_PASSWORD="your-db-password"
#    export GOOGLE_CLIENT_ID="your-client-id"
#    export GOOGLE_CLIENT_SECRET="your-client-secret"
#    export MIDTRANS_SERVER_KEY="your-server-key"
#    export MIDTRANS_CLIENT_KEY="your-client-key"
#    export MIDTRANS_MERCHANT_ID="your-merchant-id"
#
#    ./gcp/deploy-from-cloudshell.sh
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
PROJECT_ID="eventku-494416"
REGION="asia-southeast2"
INSTANCE_NAME="eventku"
REPO="eventku"
SA="eventku-sa@${PROJECT_ID}.iam.gserviceaccount.com"
BUCKET="eventku_data"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Get secrets from env vars or prompt ──────────────────────────────────────
get_secret() {
  local name="$1"
  local prompt="$2"
  local env_var="$3"
  
  # Check env var first
  local val="${!env_var:-}"
  if [ -n "$val" ]; then
    echo "$val"
    return
  fi
  
  # Prompt interactively
  read -rsp "$prompt: " val
  echo ""
  echo "$val"
}

info "Collecting secrets (set env vars to skip prompts)..."
DB_PASSWORD=$(get_secret "DB_PASSWORD" "Enter database password" "DB_PASSWORD")
GOOGLE_CLIENT_ID=$(get_secret "GOOGLE_CLIENT_ID" "Enter Google OAuth Client ID" "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_secret "GOOGLE_CLIENT_SECRET" "Enter Google OAuth Client Secret" "GOOGLE_CLIENT_SECRET")
MIDTRANS_SERVER_KEY=$(get_secret "MIDTRANS_SERVER_KEY" "Enter Midtrans Server Key" "MIDTRANS_SERVER_KEY")
MIDTRANS_CLIENT_KEY=$(get_secret "MIDTRANS_CLIENT_KEY" "Enter Midtrans Client Key" "MIDTRANS_CLIENT_KEY")
MIDTRANS_MERCHANT_ID=$(get_secret "MIDTRANS_MERCHANT_ID" "Enter Midtrans Merchant ID" "MIDTRANS_MERCHANT_ID")

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
  
  if gcloud secrets describe $name --project=$PROJECT_ID &>/dev/null; then
    info "  Secret '$name' exists, adding new version..."
  else
    info "  Creating secret '$name'..."
    gcloud secrets create $name --replication-policy=automatic --project=$PROJECT_ID
  fi
  
  echo -n "$value" | gcloud secrets versions add $name --data-file=- --project=$PROJECT_ID
}

create_secret "database-password" "$DB_PASSWORD"
create_secret "jwt-secret" "$(openssl rand -base64 32)"
create_secret "refresh-jwt-secret" "$(openssl rand -base64 32)"
create_secret "google-client-id" "$GOOGLE_CLIENT_ID"
create_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"
create_secret "midtrans-server-key" "$MIDTRANS_SERVER_KEY"
create_secret "midtrans-client-key" "$MIDTRANS_CLIENT_KEY"
create_secret "midtrans-merchant-id" "$MIDTRANS_MERCHANT_ID"

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

# Set CORS
cat > /tmp/cors.json << 'EOF'
[{"origin":["*"],"method":["GET","HEAD","PUT","POST","DELETE"],"responseHeader":["Content-Type","Authorization","X-Goog-Content-Range"],"maxAgeSeconds":3600}]
EOF
gcloud storage buckets update gs://$BUCKET --cors-file=/tmp/cors.json 2>/dev/null || true

# Disable public access prevention
gcloud storage buckets update gs://$BUCKET --no-public-access-prevention 2>/dev/null || true

# Make bucket publicly readable
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member=allUsers --role=roles/storage.objectViewer \
  --quiet 2>/dev/null || true

# Grant SA write access
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member="serviceAccount:$SA" --role=roles/storage.admin \
  --quiet 2>/dev/null || true

# ── 7. Build & Deploy Backend ───────────────────────────────────────────────
info "Building and deploying backend..."
IMAGE_API="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/eventku-api"

SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
info "Building image with tag: $SHORT_SHA"

gcloud builds submit . \
  --config=gcp/cloudbuild-backend.yaml \
  --substitutions=_REGION=$REGION,_INSTANCE_NAME=$INSTANCE_NAME,_REPO=$REPO,COMMIT_SHA=$SHORT_SHA \
  --project=$PROJECT_ID \
  --timeout=1200s

info "Backend deployed!"

# ── 8. Get Backend URL ──────────────────────────────────────────────────────
BACKEND_URL=$(gcloud run services describe eventku-api \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

info "Backend URL: $BACKEND_URL"

# ── 9. Build & Deploy Frontend ──────────────────────────────────────────────
info "Building and deploying frontend..."

gcloud builds submit . \
  --config=gcp/cloudbuild-frontend.yaml \
  --substitutions=_REGION=$REGION,_REPO=$REPO,_BACKEND_URL=$BACKEND_URL,_MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY,COMMIT_SHA=$SHORT_SHA \
  --project=$PROJECT_ID \
  --timeout=1800s

info "Frontend deployed!"

# ── 10. Get Frontend URL ─────────────────────────────────────────────────────
FRONTEND_URL=$(gcloud run services describe eventku-web \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

# ── Done! ────────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================================"
echo ""
echo "  Backend API:  $BACKEND_URL"
echo "  Frontend Web: $FRONTEND_URL"
echo ""
echo "  Cloud SQL:    $INSTANCE_NAME ($REGION)"
echo "  GCS Bucket:   gs://$BUCKET"
echo ""
echo "  Next steps:"
echo "    1. Visit the Frontend URL to test"
echo "    2. Set up custom domain in Cloud Run"
echo "    3. Configure Midtrans payment webhook"
echo ""
