# Task 7 - Mock-Data Fix Agent

## Task
Fix files that import from deleted mock-data.ts and use non-existent auth-store methods.

## Files Fixed
1. `src/components/pages/checkout-page.tsx` — Replaced all mock-data imports with real API hooks
2. `src/components/pages/my-orders-page.tsx` — Replaced Order type from mock-data with IOrder from types
3. `src/components/pages/payment-status-page.tsx` — Replaced Order type + mock polling with real API hooks
4. `src/components/pages/eticket-page.tsx` — Replaced getOrder from auth-store with useOrderDetail hook
5. `src/components/pages/payment-page.tsx` — Replaced getOrder/updateOrder with useOrderDetail hook

## Key Changes
- All 3 target files (checkout, my-orders, payment-status) no longer import from @/lib/mock-data
- 2 additional broken files (eticket, payment) fixed — they used non-existent auth-store methods
- All pages now use React Query hooks (useOrderDetail, useOrders, useTicketTypes, useEvent, usePaymentStatus)
- Loading states added for all pages
- Empty states shown when API returns no data
- Order type mapping: Order → IOrder, "rejected" → "refunded"
- Event data accessed via relations: order.event?.title, order.event?.date, order.event?.city

## Verification
- ESLint: 0 errors
- No remaining imports from deleted modules (mock-data, admin-mock-data, operational-mock-data, ws)
- No remaining references to getOrder/updateOrder/addOrder from auth-store
- Dev server running on port 3000
