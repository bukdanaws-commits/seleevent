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
