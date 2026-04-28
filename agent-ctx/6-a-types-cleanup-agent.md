# Task 6-a: Types & Cleanup Agent

## Summary
Updated frontend TypeScript types to match the hybrid database schema (20 tables with tenant_id, soft delete, seats, subscriptions, invoices). Deleted 4 mock/legacy files. Replaced db.ts with a comment.

## Key Changes
- **types.ts**: 3 new interfaces (ISeat, ISubscription, IInvoice), 3 enum changes (EventStatus, OrderStatus, GateAction), 16 interfaces updated with tenantId/other fields, ITenant.plan removed, ICreatePaymentResponse expanded
- **Deleted**: mock-data.ts, admin-mock-data.ts, operational-mock-data.ts, ws.ts
- **db.ts**: Replaced PrismaClient with comment

## Breaking Changes
4 files still import from deleted `mock-data.ts`:
- `src/components/pages/payment-status-page.tsx` — `type { Order }`
- `src/components/pages/checkout-page.tsx` — `formatRupiah, Attendee, OrderItem, Order, Ticket, mockEvent, mockUser, getAvailableQuota, getQuotaPercentage`
- `src/components/pages/my-orders-page.tsx` — `type { Order }`
- `src/app/page.tsx` — `TICKET_TIERS, FAQS, VENUE_FACILITIES, BAND_MEMBERS, SPECIAL_GUEST, HIGHLIGHTS, getAvailableQuota, getQuotaPercentage`

These need to be updated by a follow-up agent to use the canonical types from `@/lib/types` and fetch data from the API.
