-- ============================================================================
-- SeleEvent — Mock / Seed Data for Simulation
-- Sheila On 7 Concert @ GBK Madya Stadium
-- ============================================================================
-- Run this AFTER the schema has been created (GORM AutoMigrate or schema.sql).
--
-- Usage (from Cloud Shell):
--   gcloud sql connect eventku --user=eventku --database=eventku
--   \i /path/to/seed-data.sql
--
-- Or from the Go seed command:
--   go run ./cmd/seed
-- ============================================================================

-- ─── Clean existing data (respect FK order) ──────────────────────────────────
DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM gate_logs;
DELETE FROM redemptions;
DELETE FROM gate_staff;
DELETE FROM counter_staff;
DELETE FROM tickets;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM seats;
DELETE FROM wristband_inventories;
DELETE FROM ticket_types;
DELETE FROM counters;
DELETE FROM gates;
DELETE FROM events;
DELETE FROM tenant_users;
DELETE FROM subscriptions;
DELETE FROM invoices;
DELETE FROM users;
DELETE FROM tenants;

-- ============================================================================
-- 1. TENANT
-- ============================================================================

INSERT INTO tenants (id, name, slug, primary_color, secondary_color, is_active, max_events, max_tickets, plan) VALUES
('t0000000-0000-0000-0000-000000000001', 'SeleEvent', 'seleevent', '#00A39D', '#F8AD3C', true, 1, 15000, 'free');

-- ============================================================================
-- 2. SUBSCRIPTION (trial)
-- ============================================================================

INSERT INTO subscriptions (id, tenant_id, plan, status, current_period_start, current_period_end) VALUES
('s0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'free', 'trial', '2026-04-01', '2026-07-01');

-- ============================================================================
-- 3. USERS — Simulated staff & participants
-- ============================================================================
-- Note: google_id is synthetic (real Google OAuth would provide this).
-- These users can log in ONLY if their Google ID matches — which won't happen
-- with synthetic IDs. For full auth testing, use real Google accounts.
-- However, admin/staff roles are assigned here for RBAC.

-- Super Admin
INSERT INTO users (id, google_id, email, name, role, status) VALUES
('u0000000-0000-0000-0000-000000000001', 'mock-superadmin-001', 'admin@seleevent.id', 'SeleEvent Admin', 'SUPER_ADMIN', 'active');

-- Organizer (from Sheila On 7 management)
INSERT INTO users (id, google_id, email, name, role, status) VALUES
('u0000000-0000-0000-0000-000000000002', 'mock-organizer-001', 'organizer@sheilaon7.id', 'Ahmad Rizki (Organizer)', 'ORGANIZER', 'active');

-- Counter Staff (3 people)
INSERT INTO users (id, google_id, email, name, role, status) VALUES
('u0000000-0000-0000-0000-000000000010', 'mock-counter-001', 'counter1@seleevent.id', 'Siti Nurhaliza (Counter 1)', 'COUNTER_STAFF', 'active'),
('u0000000-0000-0000-0000-000000000011', 'mock-counter-002', 'counter2@seleevent.id', 'Budi Santoso (Counter 2)', 'COUNTER_STAFF', 'active'),
('u0000000-0000-0000-0000-000000000012', 'mock-counter-003', 'counter3@seleevent.id', 'Dewi Lestari (Counter 3)', 'COUNTER_STAFF', 'active');

-- Gate Staff (4 people)
INSERT INTO users (id, google_id, email, name, role, status) VALUES
('u0000000-0000-0000-0000-000000000020', 'mock-gate-001', 'gate1@seleevent.id', 'Rudi Hartono (Gate 1)', 'GATE_STAFF', 'active'),
('u0000000-0000-0000-0000-000000000021', 'mock-gate-002', 'gate2@seleevent.id', 'Maya Sari (Gate 2)', 'GATE_STAFF', 'active'),
('u0000000-0000-0000-0000-000000000022', 'mock-gate-003', 'gate3@seleevent.id', 'Joko Widodo (Gate 3)', 'GATE_STAFF', 'active'),
('u0000000-0000-0000-0000-000000000023', 'mock-gate-004', 'gate4@seleevent.id', 'Rina Wati (Gate 4)', 'GATE_STAFF', 'active');

-- Participants (10 mock users — will need real Google login for actual auth)
INSERT INTO users (id, google_id, email, name, role, status) VALUES
('u0000000-0000-0000-0000-000000000100', 'mock-participant-001', 'fan1@gmail.com', 'Dian Pratama', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000101', 'mock-participant-002', 'fan2@gmail.com', 'Raka Putra', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000102', 'mock-participant-003', 'fan3@gmail.com', 'Nisa Azkia', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000103', 'mock-participant-004', 'fan4@gmail.com', 'Fajar Nugroho', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000104', 'mock-participant-005', 'fan5@gmail.com', 'Ayu Rahmawati', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000105', 'mock-participant-006', 'fan6@gmail.com', 'Bayu Aji', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000106', 'mock-participant-007', 'fan7@gmail.com', 'Citra Dewi', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000107', 'mock-participant-008', 'fan8@gmail.com', 'Gilang Ramadhan', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000108', 'mock-participant-009', 'fan9@gmail.com', 'Hana Safira', 'PARTICIPANT', 'active'),
('u0000000-0000-0000-0000-000000000109', 'mock-participant-010', 'fan10@gmail.com', 'Irfan Hakim', 'PARTICIPANT', 'active');

-- ============================================================================
-- 4. TENANT_USERS (membership links)
-- ============================================================================

INSERT INTO tenant_users (user_id, tenant_id, role, is_active) VALUES
('u0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', true),
('u0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'ORGANIZER', true);

-- ============================================================================
-- 5. EVENT — Sheila On 7 Concert
-- ============================================================================

INSERT INTO events (id, tenant_id, slug, title, subtitle, date, doors_open, venue, city, address, capacity, status) VALUES
('e0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'sheila-on-7-live-in-jakarta',
 'Sheila On 7 — Live in Jakarta', 'Tunggu Aku di Jakarta',
 '2026-05-30 19:00:00+07', '2026-05-30 17:00:00+07',
 'GBK Madya Stadium', 'Jakarta', 'Jl. Pintu 1, Senayan, Jakarta Pusat', 15000, 'published');

-- ============================================================================
-- 6. TICKET TYPES — 6 tiers matching concert layout
-- ============================================================================

INSERT INTO ticket_types (id, tenant_id, event_id, name, description, price, quota, sold, tier, zone, emoji, benefits) VALUES
('tt000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'VVIP', 'Barisan terdepan, meet & greet eksklusif', 3500000, 200, 180, 'premium', 'A', '👑',
 '["Meet & Greet","Exclusive Merchandise","Priority Entry","Complimentary Drink"]'),

('tt000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'VIP', 'Barisan premium, merchandise eksklusif', 2500000, 500, 420, 'premium', 'B', '⭐',
 '["Exclusive Merchandise","Priority Entry","Complimentary Drink"]'),

('tt000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'CAT 1', 'Tribun barisan depan', 1500000, 1500, 1100, 'seated', 'C', '🎵',
 '["Souvenir Lanyard","Standard Entry"]'),

('tt000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'CAT 2', 'Tribun barisan tengah', 1000000, 2300, 1600, 'seated', 'D', '🎶',
 '["Standard Entry"]'),

('tt000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'CAT 3', 'Tribun barisan belakang', 750000, 3000, 1800, 'seated', 'E', '🎤',
 '["Standard Entry"]'),

('tt000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Festival', 'Area berdiri, free standing', 500000, 7500, 5200, 'floor', 'F', '🎉',
 '["Standard Entry","Festival Zone Access"]');

-- ============================================================================
-- 7. SEATS — Sample for VVIP section (A1–A10 rows × 20 seats = 200 seats)
-- ============================================================================

-- VVIP seats (zone A, 10 rows × 20 cols = 200 seats)
INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)
SELECT
    gen_random_uuid(),
    't0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'tt000000-0000-0000-0000-000000000001',
    'A',
    r.row_num::text,
    c.col_num::text,
    'A-' || r.row_num::text || '-' || c.col_num::text,
    CASE WHEN random() < 0.85 THEN 'sold' ELSE 'available' END
FROM generate_series(1, 10) AS r(row_num)
CROSS JOIN generate_series(1, 20) AS c(col_num);

-- VIP seats (zone B, 10 rows × 50 cols = 500 seats)
INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)
SELECT
    gen_random_uuid(),
    't0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'tt000000-0000-0000-0000-000000000002',
    'B',
    r.row_num::text,
    c.col_num::text,
    'B-' || r.row_num::text || '-' || c.col_num::text,
    CASE WHEN random() < 0.80 THEN 'sold' ELSE 'available' END
FROM generate_series(1, 10) AS r(row_num)
CROSS JOIN generate_series(1, 50) AS c(col_num);

-- CAT 1 seats (zone C, 15 rows × 100 = 1500)
INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)
SELECT
    gen_random_uuid(),
    't0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'tt000000-0000-0000-0000-000000000003',
    'C',
    r.row_num::text,
    c.col_num::text,
    'C-' || r.row_num::text || '-' || c.col_num::text,
    CASE WHEN random() < 0.70 THEN 'sold' ELSE 'available' END
FROM generate_series(1, 15) AS r(row_num)
CROSS JOIN generate_series(1, 100) AS c(col_num);

-- ============================================================================
-- 8. COUNTERS — Wristband redemption booths
-- ============================================================================

INSERT INTO counters (id, tenant_id, event_id, name, location, capacity, status, open_at, close_at) VALUES
('c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Counter Gate A', 'Lobby Utara', 500, 'active', '2026-05-30 15:00:00+07', '2026-05-30 21:00:00+07'),
('c0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Counter Gate B', 'Lobby Selatan', 500, 'active', '2026-05-30 15:00:00+07', '2026-05-30 21:00:00+07'),
('c0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Counter VVIP', 'VIP Lounge', 100, 'active', '2026-05-30 16:00:00+07', '2026-05-30 19:00:00+07');

-- ============================================================================
-- 9. GATES — Entry/exit points
-- ============================================================================

INSERT INTO gates (id, tenant_id, event_id, name, type, location, min_access_level, capacity_per_min, status) VALUES
('g0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Gate 1 - VVIP', 'entry', 'Lobby Utara', 'VVIP', 30, 'active'),
('g0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Gate 2 - VIP', 'entry', 'Lobby Utara', 'VIP', 30, 'active'),
('g0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Gate 3 - General', 'both', 'Lobby Selatan', NULL, 60, 'active'),
('g0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Gate 4 - General', 'both', 'Lobby Timur', NULL, 60, 'active'),
('g0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Exit Gate', 'exit', 'Lobby Barat', NULL, 80, 'active');

-- ============================================================================
-- 10. COUNTER STAFF ASSIGNMENTS
-- ============================================================================

INSERT INTO counter_staff (tenant_id, user_id, counter_id, shift, status) VALUES
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'Siang (15:00-18:00)', 'active'),
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 'Siang (15:00-18:00)', 'active'),
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 'Malam (18:00-21:00)', 'active');

-- ============================================================================
-- 11. GATE STAFF ASSIGNMENTS
-- ============================================================================

INSERT INTO gate_staff (tenant_id, user_id, gate_id, shift, status) VALUES
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000020', 'g0000000-0000-0000-0000-000000000001', 'Malam (17:00-23:00)', 'active'),
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000021', 'g0000000-0000-0000-0000-000000000002', 'Malam (17:00-23:00)', 'active'),
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000022', 'g0000000-0000-0000-0000-000000000003', 'Malam (17:00-23:00)', 'active'),
('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000023', 'g0000000-0000-0000-0000-000000000004', 'Malam (17:00-23:00)', 'active');

-- ============================================================================
-- 12. WRISTBAND INVENTORY
-- ============================================================================

INSERT INTO wristband_inventories (tenant_id, event_id, color, color_hex, type, total_stock, used_stock, remaining_stock) VALUES
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Gold',    '#FFD700', 'VVIP',     200,   0,  200),
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Silver',  '#C0C0C0', 'VIP',      500,   0,  500),
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Blue',    '#1E90FF', 'CAT 1',   1500,   0, 1500),
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Green',   '#32CD32', 'CAT 2',   2300,   0, 2300),
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Orange',  '#FF8C00', 'CAT 3',   3000,   0, 3000),
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Red',     '#DC143C', 'Festival', 7500,   0, 7500);

-- ============================================================================
-- 13. ORDERS — Mix of paid, pending, cancelled, expired
-- ============================================================================

-- PAID orders (8 orders)
INSERT INTO orders (id, tenant_id, order_code, user_id, event_id, total_amount, status, payment_type, payment_method, midtrans_transaction_id, expires_at, paid_at) VALUES
('o0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'ORD-53012A3K', 'u0000000-0000-0000-0000-000000000100', 'e0000000-0000-0000-0000-000000000001', 3500000, 'paid', 'qris', 'gopay', 'MID-001-TRX', '2026-04-25 14:30:00+07', '2026-04-25 14:15:00+07'),
('o0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'ORD-53022B7M', 'u0000000-0000-0000-0000-000000000101', 'e0000000-0000-0000-0000-000000000001', 5000000, 'paid', 'bank_transfer', 'bca_va', 'MID-002-TRX', '2026-04-25 15:00:00+07', '2026-04-25 14:45:00+07'),
('o0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'ORD-53032C9P', 'u0000000-0000-0000-0000-000000000102', 'e0000000-0000-0000-0000-000000000001', 1000000, 'paid', 'qris', 'qris', 'MID-003-TRX', '2026-04-26 10:30:00+07', '2026-04-26 10:20:00+07'),
('o0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'ORD-53042D1Q', 'u0000000-0000-0000-0000-000000000103', 'e0000000-0000-0000-0000-000000000001', 1500000, 'paid', 'bank_transfer', 'mandiri_va', 'MID-004-TRX', '2026-04-26 11:00:00+07', '2026-04-26 10:50:00+07'),
('o0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', 'ORD-53052E5R', 'u0000000-0000-0000-0000-000000000104', 'e0000000-0000-0000-0000-000000000001', 750000, 'paid', 'qris', 'shopeepay', 'MID-005-TRX', '2026-04-27 09:00:00+07', '2026-04-27 08:45:00+07'),
('o0000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000001', 'ORD-53062F3S', 'u0000000-0000-0000-0000-000000000105', 'e0000000-0000-0000-0000-000000000001', 2500000, 'paid', 'bank_transfer', 'bni_va', 'MID-006-TRX', '2026-04-27 12:00:00+07', '2026-04-27 11:30:00+07'),
('o0000000-0000-0000-0000-000000000007', 't0000000-0000-0000-0000-000000000001', 'ORD-53072G7T', 'u0000000-0000-0000-0000-000000000106', 'e0000000-0000-0000-0000-000000000001', 500000, 'paid', 'qris', 'gopay', 'MID-007-TRX', '2026-04-28 10:00:00+07', '2026-04-28 09:40:00+07'),
('o0000000-0000-0000-0000-000000000008', 't0000000-0000-0000-0000-000000000001', 'ORD-53082H9U', 'u0000000-0000-0000-0000-000000000107', 'e0000000-0000-0000-0000-000000000001', 3000000, 'paid', 'bank_transfer', 'bca_va', 'MID-008-TRX', '2026-04-28 14:00:00+07', '2026-04-28 13:20:00+07');

-- PENDING order (1)
INSERT INTO orders (id, tenant_id, order_code, user_id, event_id, total_amount, status, payment_type, payment_method, midtrans_transaction_id, expires_at) VALUES
('o0000000-0000-0000-0000-000000000009', 't0000000-0000-0000-0000-000000000001', 'ORD-53092J2V', 'u0000000-0000-0000-0000-000000000108', 'e0000000-0000-0000-0000-000000000001', 1000000, 'pending', 'qris', 'qris', 'MID-009-TRX', NOW() + interval '30 minutes');

-- CANCELLED order (1)
INSERT INTO orders (id, tenant_id, order_code, user_id, event_id, total_amount, status, expires_at) VALUES
('o0000000-0000-0000-0000-000000000010', 't0000000-0000-0000-0000-000000000001', 'ORD-53102K4W', 'u0000000-0000-0000-0000-000000000109', 'e0000000-0000-0000-0000-000000000001', 500000, 'cancelled', '2026-04-27 15:30:00+07');

-- ============================================================================
-- 14. ORDER ITEMS
-- ============================================================================

-- Order 1: 1x VVIP
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'tt000000-0000-0000-0000-000000000001', 1, 3500000, 3500000);

-- Order 2: 2x VIP
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000002', 'tt000000-0000-0000-0000-000000000002', 2, 2500000, 5000000);

-- Order 3: 1x CAT 2
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000003', 'tt000000-0000-0000-0000-000000000004', 1, 1000000, 1000000);

-- Order 4: 1x CAT 1
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000004', 'tt000000-0000-0000-0000-000000000003', 1, 1500000, 1500000);

-- Order 5: 1x CAT 3
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000005', 'tt000000-0000-0000-0000-000000000005', 1, 750000, 750000);

-- Order 6: 1x VIP
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000006', 'tt000000-0000-0000-0000-000000000002', 1, 2500000, 2500000);

-- Order 7: 1x Festival
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000007', 'tt000000-0000-0000-0000-000000000006', 1, 500000, 500000);

-- Order 8: 2x CAT 1 + 1x VIP (multi-item)
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000008', 'tt000000-0000-0000-0000-000000000003', 1, 1500000, 1500000),
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000008', 'tt000000-0000-0000-0000-000000000002', 1, 1500000, 1500000);

-- Order 9 (pending): 1x CAT 2
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000009', 'tt000000-0000-0000-0000-000000000004', 1, 1000000, 1000000);

-- Order 10 (cancelled): 1x Festival
INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES
('t0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000010', 'tt000000-0000-0000-0000-000000000006', 1, 500000, 500000);

-- ============================================================================
-- 15. TICKETS — For paid orders only (pending orders don't have tickets yet)
-- ============================================================================

-- Order 1: 1 VVIP ticket (active, not yet redeemed)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, event_title, ticket_type_name, status) VALUES
('tk000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'tt000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'SEL-A3K7-B2M9-P4X1', 'Dian Pratama', 'fan1@gmail.com', 'VVIP-A-3-7', 'SEL-A3K7-B2M9-P4X1', 'Sheila On 7 — Live in Jakarta', 'VVIP', 'active');

-- Order 2: 2 VIP tickets (1 active, 1 redeemed with wristband)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, wristband_code, event_title, ticket_type_name, status, redeemed_at, redeemed_by) VALUES
('tk000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000002', 'tt000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'SEL-C5N2-D8P1-Q6R3', 'Raka Putra', 'fan2@gmail.com', 'VIP-B-2-15', 'SEL-C5N2-D8P1-Q6R3', 'WB-SLVR1', 'Sheila On 7 — Live in Jakarta', 'VIP', 'redeemed', '2026-04-28 16:30:00+07', 'u0000000-0000-0000-0000-000000000010'),
('tk000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000002', 'tt000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'SEL-E7T4-F3W8-H2Y5', 'Raka Putra', 'fan2@gmail.com', 'VIP-B-3-22', 'SEL-E7T4-F3W8-H2Y5', NULL, 'Sheila On 7 — Live in Jakarta', 'VIP', 'active');

-- Order 3: 1 CAT 2 ticket (active)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, event_title, ticket_type_name, status) VALUES
('tk000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000003', 'tt000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001',
 'SEL-G1J6-K9L4-M7N2', 'Nisa Azkia', 'fan3@gmail.com', 'CAT2-D-5-33', 'SEL-G1J6-K9L4-M7N2', 'Sheila On 7 — Live in Jakarta', 'CAT 2', 'active');

-- Order 4: 1 CAT 1 ticket (inside - already through gate)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, wristband_code, event_title, ticket_type_name, status, redeemed_at, redeemed_by) VALUES
('tk000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000004', 'tt000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001',
 'SEL-I5O8-P3Q7-R1S9', 'Fajar Nugroho', 'fan4@gmail.com', 'CAT1-C-8-45', 'SEL-I5O8-P3Q7-R1S9', 'WB-BLUE1', 'Sheila On 7 — Live in Jakarta', 'CAT 1', 'inside', '2026-04-28 17:00:00+07', 'u0000000-0000-0000-0000-000000000011');

-- Order 5: 1 CAT 3 ticket (active)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, event_title, ticket_type_name, status) VALUES
('tk000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000005', 'tt000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001',
 'SEL-U2V6-W4X8-Y5Z3', 'Ayu Rahmawati', 'fan5@gmail.com', 'CAT3-E-12-88', 'SEL-U2V6-W4X8-Y5Z3', 'Sheila On 7 — Live in Jakarta', 'CAT 3', 'active');

-- Order 6: 1 VIP ticket (redeemed)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, wristband_code, event_title, ticket_type_name, status, redeemed_at, redeemed_by) VALUES
('tk000000-0000-0000-0000-000000000007', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000006', 'tt000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'SEL-A1B5-C3D9-E7F2', 'Bayu Aji', 'fan6@gmail.com', 'VIP-B-5-40', 'SEL-A1B5-C3D9-E7F2', 'WB-SLVR2', 'Sheila On 7 — Live in Jakarta', 'VIP', 'redeemed', '2026-04-28 17:15:00+07', 'u0000000-0000-0000-0000-000000000012');

-- Order 7: 1 Festival ticket (active)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, event_title, ticket_type_name, status) VALUES
('tk000000-0000-0000-0000-000000000008', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000007', 'tt000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001',
 'SEL-G4H8-I2J6-K1L5', 'Citra Dewi', 'fan7@gmail.com', 'Festival', 'SEL-G4H8-I2J6-K1L5', 'Sheila On 7 — Live in Jakarta', 'Festival', 'active');

-- Order 8: 2 tickets (1 CAT 1, 1 VIP)
INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, event_title, ticket_type_name, status) VALUES
('tk000000-0000-0000-0000-000000000009', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000008', 'tt000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001',
 'SEL-M3N7-O5P1-Q9R4', 'Gilang Ramadhan', 'fan8@gmail.com', 'CAT1-C-10-67', 'SEL-M3N7-O5P1-Q9R4', 'Sheila On 7 — Live in Jakarta', 'CAT 1', 'active'),
('tk000000-0000-0000-0000-000000000010', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000008', 'tt000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'SEL-S2T6-U8V1-W3X5', 'Gilang Ramadhan', 'fan8@gmail.com', 'VIP-B-7-18', 'SEL-S2T6-U8V1-W3X5', 'Sheila On 7 — Live in Jakarta', 'VIP', 'active');

-- ============================================================================
-- 16. REDEMPTIONS — For redeemed tickets
-- ============================================================================

INSERT INTO redemptions (tenant_id, ticket_id, counter_id, staff_id, wristband_code, wristband_color, wristband_type, notes) VALUES
('t0000000-0000-0000-0000-000000000001', 'tk000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000010', 'WB-SLVR1', 'Silver', 'VIP', NULL),
('t0000000-0000-0000-0000-000000000001', 'tk000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000011', 'WB-BLUE1', 'Blue', 'CAT 1', NULL),
('t0000000-0000-0000-0000-000000000001', 'tk000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000012', 'WB-SLVR2', 'Silver', 'VIP', 'Redeemed at VIP Lounge');

-- ============================================================================
-- 17. GATE LOGS — For the "inside" ticket
-- ============================================================================

INSERT INTO gate_logs (id, tenant_id, ticket_id, gate_id, staff_id, event_id, action, notes, scanned_at) VALUES
(gen_random_uuid(), 't0000000-0000-0000-0000-000000000001', 'tk000000-0000-0000-0000-000000000005', 'g0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000001', 'entry', 'Wristband verified - Blue', '2026-04-28 17:30:00+07');

-- ============================================================================
-- 18. NOTIFICATIONS — Sample notifications
-- ============================================================================

INSERT INTO notifications (id, tenant_id, user_id, event_id, title, message, type, category, is_read) VALUES
(gen_random_uuid(), 't0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000100', 'e0000000-0000-0000-0000-000000000001', 'Pembayaran Berhasil! 🎉', 'Tiket VVIP Anda untuk Sheila On 7 — Live in Jakarta sudah aktif. Selamat menikmati!', 'success', 'payment', false),
(gen_random_uuid(), 't0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000102', 'e0000000-0000-0000-0000-000000000001', 'Tiket Anda Sudah Aktif', 'Tiket CAT 2 Anda sudah aktif. Jangan lupa tukar dengan wristband di counter!', 'info', 'order', true),
(gen_random_uuid(), 't0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000104', 'e0000000-0000-0000-0000-000000000001', 'Wristband Tersedia', 'Tiket CAT 1 Anda sudah bisa ditukar dengan wristband di Counter Gate A atau B.', 'info', 'redemption', false),
(gen_random_uuid(), 't0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000108', 'e0000000-0000-0000-0000-000000000001', 'Menunggu Pembayaran', 'Pesanan Anda sedang menunggu pembayaran. Selesaikan dalam 30 menit!', 'warning', 'payment', false);

-- ============================================================================
-- DONE! Seed data loaded.
-- ============================================================================
--
-- Summary:
--   1 Tenant (SeleEvent)
--   1 Subscription (trial)
--   20 Users (1 admin, 1 organizer, 3 counter staff, 4 gate staff, 10 participants, 1 admin)
--   2 TenantUsers
--   1 Event (Sheila On 7 — Live in Jakarta)
--   6 Ticket Types (VVIP, VIP, CAT 1, CAT 2, CAT 3, Festival)
--   ~3700 Seats (VVIP, VIP, CAT 1 zones)
--   3 Counters (wristband redemption booths)
--   5 Gates (entry, exit, both)
--   3 Counter Staff assignments
--   4 Gate Staff assignments
--   6 Wristband Inventory records
--   10 Orders (8 paid, 1 pending, 1 cancelled)
--   12 Order Items
--   10 Tickets (5 active, 2 redeemed, 1 inside, 2 from multi-order)
--   3 Redemptions
--   1 Gate Log
--   4 Notifications
-- ============================================================================
