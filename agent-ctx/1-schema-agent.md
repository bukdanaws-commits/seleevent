# Task 1 — Schema Agent Work Record

## Task
Create HYBRID PostgreSQL DDL schema file combining the best of both schemas for the SeleEvent project.

## Output File
`/home/z/my-project/backend/database/schema.sql` (717 lines)

## Summary
Created a comprehensive production-ready PostgreSQL DDL schema with 20 tables that merges:

- **From NEW schema**: subscriptions, invoices, seats master table, tenant_id on all tables, soft delete, CHECK constraints, gate_logs partitioning, denormalized ticket fields, native UUID PKs via pgcrypto, seat_id FK with unique constraint, unique_event_seat constraint
- **From EXISTING schema**: counters, counter_staff, gates, gate_staff, redemptions, users.google_id, RBAC roles, user status, order_code/Midtrans fields, ticket lifecycle (7 statuses), tenant branding, full event/ticket_type metadata, wristband inventory tracking, notifications with event_id/category/data

## Key Design Decisions
1. Used PostgreSQL ENUM types (7 total) for strong data integrity on status/action columns
2. `set_updated_at()` trigger auto-applied to all tables with `updated_at` column
3. `enforce_ticket_type_quota()` and `enforce_wristband_stock()` triggers as runtime safety nets beyond CHECK constraints
4. gate_logs partitioned by RANGE on `scanned_at` with explicit 2026-04 partition + default catch-all
5. Partial unique index on subscriptions (one active per tenant via WHERE clause)
6. Partial index to detect seated tickets missing seat assignments
7. schema_migrations table for version tracking
8. All FKs use appropriate ON DELETE actions (CASCADE for ownership, SET NULL for optional references, RESTRICT for critical lookups)

## Tables Created
tenants, subscriptions, invoices, users, tenant_users, events, ticket_types, seats, orders, order_items, tickets, counters, counter_staff, gates, gate_staff, redemptions, gate_logs, wristband_inventories, notifications, audit_logs
