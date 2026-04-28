# Task 2A — Frontend Core Infrastructure Agent

## Summary
Rebuilt frontend core infrastructure to properly connect to the Golang backend. All mock data fallbacks removed (except DEV-only `loginAsRole`), replaced WebSocket with SSE, added envelope unwrapping, React Query provider, and 50+ typed hooks.

## Files Created
- `/src/lib/sse.ts` — SSE client using EventSource API (replaces WebSocket)
- `/src/lib/query-client.ts` — React Query client instance
- `/src/hooks/use-api.ts` — 50+ typed React Query hooks + queryKeys factory

## Files Modified
- `/src/lib/api.ts` — Complete rewrite: envelope unwrapping, new API groups (orderApi, paymentApi, notificationApi, adminApi, publicApi)
- `/src/lib/types.ts` — Expanded types: TicketStatus, ICreateOrder*, IPayment*, IPagination, ISSEEvent, ISystemHealth, updated relations
- `/src/lib/auth-store.ts` — Removed mock fallback, added rehydrateSession(), SSE connect/disconnect
- `/src/app/layout.tsx` — Added QueryClientProvider wrapper

## Files Replaced
- `/src/lib/ws.ts` → `/src/lib/sse.ts` (WebSocket → SSE)

## Key Decisions
1. Backend envelope `{ success, data, meta }` is unwrapped in `apiFetch<T>()` — callers receive `T` directly
2. Paginated responses return `{ data: T[], pagination: IPagination }` after unwrapping
3. SSE uses `?token=` query param (EventSource cannot send headers)
4. `loginAsRole()` is DEV ONLY — real `login()` throws on failure, no mock fallback
5. `rehydrateSession()` calls `/auth/me` on app load to restore session from stored token
6. Smart polling: payment status 5s (stops when settled), live monitors 5s, counters 10s, notifications 30s

## Lint Status
✅ ESLint passes clean
✅ Dev server compiles successfully
