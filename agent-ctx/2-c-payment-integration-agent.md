# Task 2-c: Payment Integration Agent

## Task
Implement proper Midtrans payment gateway integration in the Go backend.

## Summary
Successfully implemented full Midtrans Snap payment gateway integration with all required endpoints and payment flow.

## Files Modified
1. `/home/z/my-project/backend/internal/config/config.go` — Added MidtransConfig struct and viper bindings
2. `/home/z/my-project/backend/internal/services/payment_service.go` — Complete rewrite with Snap + direct charge support
3. `/home/z/my-project/backend/internal/handlers/payment_handler.go` — Rewritten with Snap create, notification webhook, and status endpoints
4. `/home/z/my-project/backend/internal/routes/routes.go` — Added /payment/notification and /payment/create-direct routes
5. `/home/z/my-project/backend/internal/services/order_service.go` — Enhanced ProcessPaymentCallback for pending→active ticket flow

## Key Decisions
- Snap API is the primary flow (returns snap_token for frontend popup)
- Direct charge API kept as legacy fallback (/payment/create-direct)
- SHA-512 primary signature verification with SHA-256 fallback
- Config reads from both env vars and config.Cfg with fallback
- PaymentNotification always returns 200 to Midtrans (prevents retry loops)
- GetPaymentStatus auto-syncs local order if Midtrans reports different status

## Verification
- `go build ./...` — PASS
- `go vet ./...` — PASS
