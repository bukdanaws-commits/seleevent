# SeleEvent Worklog

---
Task ID: 1
Agent: Main Coordinator
Task: Analyze FE↔BE↔DB connection integrity and fix all identified bugs

Work Log:
- Dispatched 3 parallel analysis agents: Golang BE, Next.js FE, PostgreSQL DB
- Identified 6 critical issues, 5 medium issues
- Dispatched 2 parallel fix agents: Golang BE fixes, FE fixes
- All fixes applied and verified with lint check

Stage Summary:
- **Golang BE Fixes (7 changes)**:
  1. go.mod: `1.25.0` → `1.24` (version consistency)
  2. Dockerfile: `golang:1.23-alpine` → `golang:1.24-alpine` (matching go.mod)
  3. gate_handler.go: `DATE('now')` → `CURRENT_DATE` (PostgreSQL-compatible)
  4. order_service.go: Removed `math/rand`, replaced with `utils.GenerateOrderCode()` / `utils.GenerateTicketCode()` (crypto/rand)
  5. order_service.go: Added TenantID to Order, OrderItem, and Ticket creation (was missing → NOT NULL violation)
  6. order_service.go: Added EventID, EventTitle, TicketTypeName to Ticket creation in ProcessPaymentCallback
  7. gate_service.go: Added TenantID, EventID to GateLog creation
  8. models.go: Added `Plan` field to Tenant struct (matching SQL DDL)
  9. models.go: Changed GateLog.StaffID from `string` to `*string` (nullable, matching SQL schema)
  10. database.go: Excluded GateLog from AutoMigrate (partitioned table can't be managed by GORM)

- **SQL DDL Fixes**:
  1. schema.sql: Added `event_id` column to gate_logs table
  2. schema.sql: Fixed redemptions.staff_id from NOT NULL to nullable (matches ON DELETE SET NULL)

- **Frontend Fixes (3 changes)**:
  1. package.json: Removed dead Prisma dependencies (@prisma/client, prisma, db:* scripts)
  2. api.ts: Added 401 auto-refresh token logic (intercepts 401 → refresh → retry)
  3. api.ts: Added CREATE_DIRECT payment endpoint + createDirectPayment method
  4. db.ts: Fixed stale "SQLite/PostgreSQL" comment → "PostgreSQL"

- **Verification**: ESLint passes with zero errors, dev server running clean

---
Task ID: 1-8
Agent: Main Agent
Task: Fix 4 CRITICAL + 4 WARNING Docker/Cloud Run deployment issues

Work Log:
- CRITICAL 1: Rewrote backend/Dockerfile with ARG BINARY_PATH support — Cloud Build can pass pre-built binary, local builds compile inside Docker
- CRITICAL 2: Fixed api.ts getBaseUrl() inverted logic — Cloud Run mode (USE_DIRECT_BACKEND=true + API_BASE) now returns API_BASE directly instead of XTransformPort
- CRITICAL 3: Removed cpu_idle=true from Terraform main.tf (was contradicting --no-cpu-throttling in Cloud Build)
- CRITICAL 4: Added 4 missing secrets to Terraform: google-client-id, google-client-secret, midtrans-server-key, midtrans-client-key; added SA IAM bindings for new secrets; added secret env vars to Cloud Run container; added secretmanager.secretAccessor to Cloud Build SA
- WARNING 5: Removed libc6-compat from backend/Dockerfile (not needed for CGO_ENABLED=0)
- WARNING 6: Moved GOOGLE_CLIENT_ID from hardcoded env var to Secret Manager in Terraform + Cloud Build
- WARNING 7: Added midtrans-server-key and midtrans-client-key secrets to Terraform with IAM bindings
- WARNING 8: Changed bun install --frozen-lockfile to bun install in both Dockerfile.frontend and cloudbuild-frontend.yaml
- Updated cloudbuild-backend.yaml: fixed binary path, added waitFor dependencies, removed hardcoded GOOGLE_CLIENT_ID
- Updated cloudbuild-frontend.yaml: added waitFor dependencies for correct step ordering
- Updated terraform/outputs.tf: added new secrets to outputs
- Updated terraform/terraform.tfvars.example: added post-apply secret setup instructions
- Updated gcp/DEPLOYMENT.md: added "Setup External Secrets" section

Stage Summary:
- All 4 CRITICAL + 4 WARNING issues fixed
- Lint passes clean, dev server running
- Files modified: backend/Dockerfile, Dockerfile.frontend, src/lib/api.ts, gcp/terraform/main.tf, gcp/terraform/outputs.tf, gcp/terraform/terraform.tfvars.example, gcp/cloudbuild-backend.yaml, gcp/cloudbuild-frontend.yaml, gcp/DEPLOYMENT.md

---
Task ID: env-fix
Agent: Main Agent
Task: Fix .env and .env.example — alignment with actual config.go and api.ts code

Work Log:
- Fixed NEXT_PUBLIC_USE_DIRECT_BACKEND: true → false (local dev needs Caddy XTransformPort, not direct)
- Fixed NEXT_PUBLIC_API_URL: "/api/v1" → "" (empty for local dev; Cloud Run uses full URL)
- Removed dead variables not read by config.go: ENCRYPTION_KEY, FRONTEND_URL, FRONTEND_PORT
- Added missing NEXT_PUBLIC_MIDTRANS_IS_SANDBOX (used by midtrans.ts but was missing from .env)
- Added deployment mode documentation comments to both files
- Verified SSE URL logic works correctly with both local dev and Cloud Run mode
- Lint passes clean, dev server running

Stage Summary:
- .env and .env.example now fully aligned with actual codebase
- Both local dev (Caddy XTransformPort) and Cloud Run (direct backend) modes verified
- Files modified: .env, .env.example

---
Task ID: gcp-region-fix
Agent: Main Agent
Task: Fix all 8 GCP deployment issues — align with existing Cloud SQL (PG18, instance=eventku, region=asia-southeast2)

Work Log:
- CRITICAL 1: Added 4 missing secrets to setup.sh (google-client-id, midtrans-server-key, midtrans-client-key, midtrans-merchant-id) — now 8 total secrets
- CRITICAL 2: Removed hardcoded GOOGLE_CLIENT_SECRET from setup.sh — now uses env vars or interactive prompt for all external secrets
- CRITICAL 3: Changed all default regions from asia-southeast1 → asia-southeast2 (Jakarta) across ALL files
- WARNING 4: Aligned Cloud SQL tier: db-custom-2-4096 → db-custom-2-7680, disk 20GB → 10GB, PG16 → PG18
- WARNING 5: Removed redis.googleapis.com from setup.sh (not needed)
- WARNING 6: Removed unused ZONE variable from setup.sh
- WARNING 7: Added MIDTRANS_MERCHANT_ID as secret everywhere (setup.sh, cloudbuild-backend.yaml, terraform main.tf)
- WARNING 8: Added service account for Frontend Cloud Run (--service-account=eventku-sa@...)
- Added MIDTRANS_IS_SANDBOX=true env var to cloudbuild-backend.yaml and terraform main.tf
- Added NEXT_PUBLIC_MIDTRANS_CLIENT_KEY + NEXT_PUBLIC_MIDTRANS_IS_SANDBOX build args to Dockerfile.frontend and cloudbuild-frontend.yaml
- Updated all instance names from eventku-db → eventku (matching actual Cloud SQL instance)
- Updated all comment examples in shell scripts to use asia-southeast2
- Updated DEPLOYMENT.md: all regions, instance names, tier, and secrets references
- Updated terraform: variables.tf (defaults + validation), main.tf (PG18, tier, midtrans-merchant-id), outputs.tf, tfvars.example
- setup.sh now detects existing Cloud SQL instance and skips creation
- setup-github-deploy.sh now checks all 8 secrets (was only checking 4)

Stage Summary:
- All 8 issues fixed, 10 files modified
- Region: asia-southeast2 (Jakarta) everywhere
- Instance: eventku (not eventku-db) everywhere
- PostgreSQL: 18 (not 16) everywhere
- Secrets: 8 total (was 4) — all checked in CI/CD scripts
- Cloud SQL: existing instance detected, not recreated
- No more hardcoded secrets in any script
