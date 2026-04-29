# SeleEvent Worklog

---
Task ID: 1
Agent: Main Agent
Task: Code review and bug fixing of SeleEvent backend

Work Log:
- Read all backend source files: models, handlers, routes, seed data, payment service, gate service
- Verified all previously agreed features are already implemented (fee_percentage, platform_fee, Events CRUD, Ticket Types CRUD, Tenant Settings API, Dashboard Enhancement, Payment service)
- Found critical bug: GateLog model uses BaseModel (has updated_at) but schema has no updated_at column → Fixed to BaseModelNoUpdate
- Found critical bug: Seed data has duplicate midtrans_transaction_id across Event 1 and Event 2 orders → Fixed with unique BDG-prefixed IDs
- Found significant bug: Missing "refund" case in ProcessPaymentCallback → Added with platform_fee=0, ticket cancellation, sold count restoration
- Found significant bug: Gate actions use "IN"/"OUT" but SQL enum uses "entry"/"exit" → Fixed across gate_service.go, gate_handler.go, admin_handler.go, organizer_handler.go, stats_service.go
- Found minor bug: CancelOrder doesn't reset platform_fee → Added "platform_fee": 0 to updates map
- Found minor bug: Hardcoded wristband guide mismatches seed data → Fixed in counter_handler.go and organizer_handler.go
- Fixed idempotency guard to include "refunded" status
- Fixed generate_seed.py to use global order counter for unique midtrans IDs
- Created gcp/seed-database.sh to fix the Cloud SQL seed loading issue (gcloud sql connect with < fails)
- Updated gcp/deploy-from-cloudshell.sh to reference the new seed script

Stage Summary:
- All 6 bugs fixed across 10+ Go files
- Seed data SQL file updated with unique midtrans IDs
- New seed-database.sh script created for proper Cloud SQL data loading
- Project is ready for push to GitHub and redeploy

---
Task ID: 2
Agent: Main Agent
Task: Push to GitHub and verify all endpoints

Work Log:
- Reviewed worklog from previous session — all bugs already fixed
- Verified all backend files: schema.sql (fee_percentage, platform_fee), models.go (FeePercentage, PlatformFee), routes.go (all CRUD endpoints registered)
- Verified handler implementations: event_handler.go (CRUD), ticket_type_handler.go (CRUD), tenant_handler.go (fee_percentage 1-10% validation, SUPER_ADMIN only)
- Verified order_service.go: platform_fee calculated on payment success, set 0 on cancel/expired/refund
- Verified admin_handler.go: enhanced dashboard with global stats + per-event breakdown (grossRevenue, platformFee, netRevenue)
- Frontend lint passed clean (no errors)
- Rebased on top of remote (f1cd32c: accidental "aaaaaaaaaaaaabase" commit)
- Pushed to GitHub: f5bfeec → origin/main
- Verified staging endpoints: backend returns 503 (degraded mode, DB not connected), frontend returns 200

Stage Summary:
- Code pushed to GitHub successfully (commit f5bfeec)
- All 65+ API endpoints verified in routes.go
- Frontend lint: clean
- Staging backend currently in degraded mode (needs redeploy from Cloud Shell)
- Next step: User needs to redeploy from Cloud Shell using deploy scripts

---
Task ID: 3
Agent: Main Agent
Task: Fix database schema + seed data UUID issues after failed seeding

Work Log:
- Analyzed Cloud Shell output showing 3 categories of errors during database seeding
- Issue 1: schema.sql line 83-84 has inline UNIQUE (tenant_id) WHERE cancelled_at IS NULL — PostgreSQL doesn't support partial unique constraints inline, only via CREATE UNIQUE INDEX
- Issue 2: All seed data UUIDs use non-hex prefixes (t, u, o, g, tk, tt) that PostgreSQL's uuid type rejects — e.g. "t0000000-0000-0000-0000-000000000001" (t is not hex)
- Issue 3: Batch INSERT splitting bug — tickets, redemptions, gate_logs, notifications batches >15 rows lose the INSERT INTO header on 2nd+ batch → syntax errors
- Issue 4: cloud-sql-proxy defaults to PUBLIC IP but instance only has PRIVATE IP → need --private-ip flag
- Fixed schema.sql: moved inline UNIQUE WHERE → separate CREATE UNIQUE INDEX ... WHERE
- Fixed generate_seed.py: replaced all non-hex UUID prefixes with hex-only patterns:
  10000000=tenant, 11000000=subscription, 20000000=user, 30000000=event,
  40000000=ticket_type, 50000000=order, 60000000=counter, 70000000=gate, 80000000=ticket
- Fixed generate_seed.py: each INSERT batch now gets its own INSERT INTO header
- Fixed seed-database.sh: added --private-ip to cloud-sql-proxy command
- Regenerated seed-data.sql: 760 lines, 1622 UUIDs, all valid hex format
- Validated all UUIDs with Python regex: 0 invalid
- Pushed to GitHub: abef8f4 → origin/main
- Frontend lint: clean

Stage Summary:
- All 4 database issues fixed
- Seed data fully regenerated with valid UUIDs
- Committed and pushed to GitHub (abef8f4)
- User needs to: pull latest code, redeploy, reseed with fixed scripts

---
Task ID: 4
Agent: Main Agent
Task: Fix Google Login - email_verified type mismatch

Work Log:
- Diagnosed error: `json: cannot unmarshal string into Go struct field GoogleTokenInfo.email_verified of type bool`
- Root cause: Google's tokeninfo API returns `email_verified` as a string ("true"/"false"), not a boolean
- Fixed `backend/internal/services/auth_service.go`: Changed `EmailVerified` from `bool` to `string`
- Updated verification check from `!tokenInfo.EmailVerified` to `tokenInfo.EmailVerified != "true"`
- Committed and pushed to GitHub: 1077dca → origin/main
- gcloud CLI not available in dev environment — deployment must be triggered from Cloud Shell

Stage Summary:
- Google Login fix committed and pushed (1077dca)
- User needs to deploy from Cloud Shell: `cd seleevent && git pull && ./gcp/deploy-from-cloudshell.sh staging`
