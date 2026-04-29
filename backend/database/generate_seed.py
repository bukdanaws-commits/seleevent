#!/usr/bin/env python3
"""
SeleEvent — Seed Data Generator
Generates a comprehensive seed-data.sql file for the SeleEvent concert ticketing system.
"""

import random
import string
import os

# ─── Deterministic "random" helpers ───────────────────────────────────────────

class SeededRandom:
    """Wrapper around random with a fixed seed for deterministic output."""
    def __init__(self, seed=42):
        self.rng = random.Random(seed)

    def choice(self, seq):
        return self.rng.choice(seq)

    def randint(self, a, b):
        return self.rng.randint(a, b)

    def shuffle(self, seq):
        return self.rng.shuffle(seq)

    def sample(self, seq, k):
        return self.rng.sample(seq, k)

rng = SeededRandom(42)

# ─── ID helpers ───────────────────────────────────────────────────────────────

# All UUIDs MUST use only hex digits (0-9, a-f) to be valid PostgreSQL uuid type.
# Entity prefix mapping (first 8 hex chars):
#   10000000 = tenant,  11000000 = subscription
#   20000000 = user,    30000000 = event
#   40000000 = ticket_type, 50000000 = order
#   60000000 = counter, 70000000 = gate
#   80000000 = ticket

def user_id(short_id):
    """e.g. 1 -> '20000000-0000-0000-0000-000000000001'"""
    suffix = f"{short_id:012d}"
    return f"20000000-0000-0000-0000-{suffix}"

def tenant_id(short_id=1):
    suffix = f"{short_id:012d}"
    return f"10000000-0000-0000-0000-{suffix}"

def sub_id(short_id=1):
    suffix = f"{short_id:012d}"
    return f"11000000-0000-0000-0000-{suffix}"

def event_id(short_id):
    suffix = f"{short_id:012d}"
    return f"30000000-0000-0000-0000-{suffix}"

def tt_id(short_id):
    suffix = f"{short_id:012d}"
    return f"40000000-0000-0000-0000-{suffix}"

def order_id(short_id):
    suffix = f"{short_id:012d}"
    return f"50000000-0000-0000-0000-{suffix}"

def ticket_id(short_id):
    suffix = f"{short_id:012d}"
    return f"80000000-0000-0000-0000-{suffix}"

def counter_id(short_id):
    suffix = f"{short_id:012d}"
    return f"60000000-0000-0000-0000-{suffix}"

def gate_id(short_id):
    suffix = f"{short_id:012d}"
    return f"70000000-0000-0000-0000-{suffix}"

# ─── Code generators ─────────────────────────────────────────────────────────

def gen_order_code(idx):
    """ORD-XXXXX format, deterministic but random-looking."""
    chars = string.ascii_uppercase + string.digits
    # Use index to seed deterministically
    local_rng = random.Random(idx * 31337)
    code = ''.join(local_rng.choice(chars) for _ in range(5))
    return f"ORD-{code}"

def gen_ticket_code():
    """SEL-XXXX-YYYY-ZZZZ format."""
    chars = string.ascii_uppercase + string.digits
    blocks = [''.join(rng.choice(chars) for _ in range(4)) for _ in range(3)]
    return f"SEL-{blocks[0]}-{blocks[1]}-{blocks[2]}"

def gen_wristband_code():
    """WB-XXXX format."""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(rng.choice(chars) for _ in range(4))
    return f"WB-{code}"

def gen_midtrans_id(idx):
    chars = string.ascii_uppercase + string.digits
    local_rng = random.Random(idx * 7919)
    suffix = ''.join(local_rng.choice(chars) for _ in range(6))
    return f"MID-{suffix}"

# ─── Platform fee calculation ─────────────────────────────────────────────────

def calc_fee(amount):
    return round(amount * 3.0 / 100 / 1000) * 1000

# ─── SQL escape ───────────────────────────────────────────────────────────────

def esc(s):
    """Escape single quotes for SQL."""
    return s.replace("'", "''")

# ─── Data definitions ─────────────────────────────────────────────────────────

TENANT_UUID = tenant_id(1)
SUB_UUID = sub_id(1)

# Users
USERS = [
    # (short_id, role, email, name)
    (1, 'SUPER_ADMIN', 'admin@seleevent.id', 'SeleEvent Admin'),
    (2, 'ORGANIZER', 'organizer@sheilaon7.id', 'Ahmad Rizki (Organizer)'),
    (3, 'ORGANIZER', 'organizer2@sheilaon7.id', 'Wulan Sari (Organizer 2)'),
    (10, 'COUNTER_STAFF', 'counter1@seleevent.id', 'Siti Nurhaliza'),
    (11, 'COUNTER_STAFF', 'counter2@seleevent.id', 'Budi Santoso'),
    (12, 'COUNTER_STAFF', 'counter3@seleevent.id', 'Dewi Lestari'),
    (20, 'GATE_STAFF', 'gate1@seleevent.id', 'Rudi Hartono'),
    (21, 'GATE_STAFF', 'gate2@seleevent.id', 'Maya Sari'),
    (22, 'GATE_STAFF', 'gate3@seleevent.id', 'Joko Widodo'),
    (23, 'GATE_STAFF', 'gate4@seleevent.id', 'Rina Wati'),
    (100, 'PARTICIPANT', 'fan1@gmail.com', 'Dian Pratama'),
    (101, 'PARTICIPANT', 'fan2@gmail.com', 'Raka Putra'),
    (102, 'PARTICIPANT', 'fan3@gmail.com', 'Nisa Azkia'),
    (103, 'PARTICIPANT', 'fan4@gmail.com', 'Fajar Nugroho'),
    (104, 'PARTICIPANT', 'fan5@gmail.com', 'Ayu Rahmawati'),
    (105, 'PARTICIPANT', 'fan6@gmail.com', 'Bayu Aji'),
    (106, 'PARTICIPANT', 'fan7@gmail.com', 'Citra Dewi'),
    (107, 'PARTICIPANT', 'fan8@gmail.com', 'Gilang Ramadhan'),
    (108, 'PARTICIPANT', 'fan9@gmail.com', 'Hana Safira'),
    (109, 'PARTICIPANT', 'fan10@gmail.com', 'Irfan Hakim'),
    (110, 'PARTICIPANT', 'fan11@gmail.com', 'Kemal Fauzi'),
    (111, 'PARTICIPANT', 'fan12@gmail.com', 'Larasati Putri'),
    (112, 'PARTICIPANT', 'fan13@gmail.com', 'Mochammad Iqbal'),
    (113, 'PARTICIPANT', 'fan14@gmail.com', 'Nadira Zahra'),
    (114, 'PARTICIPANT', 'fan15@gmail.com', 'Oscar Pratama'),
    (115, 'PARTICIPANT', 'fan16@gmail.com', 'Putri Amalina'),
    (116, 'PARTICIPANT', 'fan17@gmail.com', 'Rahmat Hidayat'),
    (117, 'PARTICIPANT', 'fan18@gmail.com', 'Sinta Dewi'),
    (118, 'PARTICIPANT', 'fan19@gmail.com', 'Taufik Rizal'),
    (119, 'PARTICIPANT', 'fan20@gmail.com', 'Umi Kalsum'),
]

# Build user lookup
USER_MAP = {uid: (role, email, name) for uid, role, email, name in USERS}
PARTICIPANT_IDS = [uid for uid, role, _, _ in USERS if role == 'PARTICIPANT']

# Events
EVENTS = [
    {
        'short_id': 1,
        'slug': 'sheila-on7-jakarta',
        'title': 'Sheila On 7 — Live in Jakarta',
        'subtitle': 'Tunggu Aku di Jakarta',
        'date': '2026-05-30 19:00:00+07',
        'doors_open': '2026-05-30 17:00:00+07',
        'venue': 'GBK Madya Stadium',
        'city': 'Jakarta',
        'address': 'Jl. Pintu 1, Senayan, Jakarta Pusat',
        'capacity': 15000,
        'status': 'published',
    },
    {
        'short_id': 2,
        'slug': 'sheila-on7-bandung',
        'title': 'Sheila On 7 Tour — Bandung',
        'subtitle': 'Kita Bercerita di Bandung',
        'date': '2026-06-15 19:00:00+07',
        'doors_open': '2026-06-15 17:00:00+07',
        'venue': 'Siliwangi Stadium',
        'city': 'Bandung',
        'address': 'Jl. Siliwangi, Bandung',
        'capacity': 10000,
        'status': 'published',
    },
]

# Ticket types
TICKET_TYPES = [
    # Event 1
    {'short_id': 1, 'event_short_id': 1, 'name': 'VVIP', 'desc': 'Barisan terdepan, meet & greet eksklusif',
     'price': 3500000, 'quota': 200, 'sold': 30, 'tier': 'premium', 'zone': 'A', 'emoji': '👑',
     'benefits': '["Meet & Greet","Exclusive Merchandise","Priority Entry","Complimentary Drink"]'},
    {'short_id': 2, 'event_short_id': 1, 'name': 'VIP', 'desc': 'Barisan premium, merchandise eksklusif',
     'price': 2500000, 'quota': 500, 'sold': 55, 'tier': 'premium', 'zone': 'B', 'emoji': '⭐',
     'benefits': '["Exclusive Merchandise","Priority Entry","Complimentary Drink"]'},
    {'short_id': 3, 'event_short_id': 1, 'name': 'CAT 1', 'desc': 'Tribun barisan depan',
     'price': 1500000, 'quota': 1500, 'sold': 42, 'tier': 'seated', 'zone': 'C', 'emoji': '🎵',
     'benefits': '["Souvenir Lanyard","Standard Entry"]'},
    {'short_id': 4, 'event_short_id': 1, 'name': 'CAT 2', 'desc': 'Tribun barisan tengah',
     'price': 1000000, 'quota': 2300, 'sold': 38, 'tier': 'seated', 'zone': 'D', 'emoji': '🎶',
     'benefits': '["Standard Entry"]'},
    {'short_id': 5, 'event_short_id': 1, 'name': 'CAT 3', 'desc': 'Tribun barisan belakang',
     'price': 750000, 'quota': 3000, 'sold': 35, 'tier': 'seated', 'zone': 'E', 'emoji': '🎤',
     'benefits': '["Standard Entry"]'},
    {'short_id': 6, 'event_short_id': 1, 'name': 'Festival', 'desc': 'Area berdiri, free standing',
     'price': 500000, 'quota': 7500, 'sold': 55, 'tier': 'floor', 'zone': 'F', 'emoji': '🎉',
     'benefits': '["Standard Entry","Festival Zone Access"]'},
    # Event 2
    {'short_id': 7, 'event_short_id': 2, 'name': 'Premium', 'desc': 'Pengalaman premium, meet & greet',
     'price': 2000000, 'quota': 500, 'sold': 28, 'tier': 'premium', 'zone': 'P', 'emoji': '👑',
     'benefits': '["Meet & Greet","Exclusive Merchandise","Priority Entry"]'},
    {'short_id': 8, 'event_short_id': 2, 'name': 'CAT 1', 'desc': 'Tribun barisan depan',
     'price': 1200000, 'quota': 2000, 'sold': 18, 'tier': 'seated', 'zone': 'Q', 'emoji': '🎵',
     'benefits': '["Souvenir Lanyard","Standard Entry"]'},
    {'short_id': 9, 'event_short_id': 2, 'name': 'CAT 2', 'desc': 'Tribun barisan tengah',
     'price': 800000, 'quota': 3000, 'sold': 22, 'tier': 'seated', 'zone': 'R', 'emoji': '🎶',
     'benefits': '["Standard Entry"]'},
    {'short_id': 10, 'event_short_id': 2, 'name': 'Festival', 'desc': 'Area berdiri, free standing',
     'price': 450000, 'quota': 4500, 'sold': 25, 'tier': 'floor', 'zone': 'S', 'emoji': '🎉',
     'benefits': '["Standard Entry","Festival Zone Access"]'},
]

# Build TT lookup
TT_MAP = {}  # short_id -> tt dict
TT_BY_EVENT = {}  # event_short_id -> [tt_dict, ...]
for tt in TICKET_TYPES:
    TT_MAP[tt['short_id']] = tt
    TT_BY_EVENT.setdefault(tt['event_short_id'], []).append(tt)

# Counters
COUNTERS = [
    {'short_id': 1, 'event_short_id': 1, 'name': 'Counter Gate A', 'location': 'Lobby Utara',
     'capacity': 500, 'status': 'active', 'open_at': '2026-05-30 15:00:00+07', 'close_at': '2026-05-30 21:00:00+07'},
    {'short_id': 2, 'event_short_id': 1, 'name': 'Counter Gate B', 'location': 'Lobby Selatan',
     'capacity': 500, 'status': 'active', 'open_at': '2026-05-30 15:00:00+07', 'close_at': '2026-05-30 21:00:00+07'},
    {'short_id': 3, 'event_short_id': 1, 'name': 'Counter VVIP', 'location': 'VIP Lounge',
     'capacity': 100, 'status': 'active', 'open_at': '2026-05-30 16:00:00+07', 'close_at': '2026-05-30 19:00:00+07'},
    {'short_id': 4, 'event_short_id': 2, 'name': 'Counter Utama', 'location': 'Lobby Utama',
     'capacity': 500, 'status': 'active', 'open_at': '2026-06-15 15:00:00+07', 'close_at': '2026-06-15 21:00:00+07'},
    {'short_id': 5, 'event_short_id': 2, 'name': 'Counter VIP', 'location': 'VIP Lounge',
     'capacity': 200, 'status': 'active', 'open_at': '2026-06-15 16:00:00+07', 'close_at': '2026-06-15 19:00:00+07'},
]

# Gates
GATES = [
    {'short_id': 1, 'event_short_id': 1, 'name': 'Gate 1 - VVIP', 'type': 'entry',
     'location': 'Lobby Utara', 'min_access': 'VVIP', 'capacity_per_min': 30, 'status': 'active'},
    {'short_id': 2, 'event_short_id': 1, 'name': 'Gate 2 - VIP', 'type': 'entry',
     'location': 'Lobby Utara', 'min_access': 'VIP', 'capacity_per_min': 30, 'status': 'active'},
    {'short_id': 3, 'event_short_id': 1, 'name': 'Gate 3 - General', 'type': 'both',
     'location': 'Lobby Selatan', 'min_access': None, 'capacity_per_min': 60, 'status': 'active'},
    {'short_id': 4, 'event_short_id': 1, 'name': 'Gate 4 - General', 'type': 'both',
     'location': 'Lobby Timur', 'min_access': None, 'capacity_per_min': 60, 'status': 'active'},
    {'short_id': 5, 'event_short_id': 1, 'name': 'Exit Gate', 'type': 'exit',
     'location': 'Lobby Barat', 'min_access': None, 'capacity_per_min': 80, 'status': 'active'},
    # Event 2
    {'short_id': 6, 'event_short_id': 2, 'name': 'Gate 1 Premium', 'type': 'entry',
     'location': 'Lobby Utara', 'min_access': 'Premium', 'capacity_per_min': 30, 'status': 'active'},
    {'short_id': 7, 'event_short_id': 2, 'name': 'Gate 2 General', 'type': 'both',
     'location': 'Lobby Selatan', 'min_access': None, 'capacity_per_min': 60, 'status': 'active'},
    {'short_id': 8, 'event_short_id': 2, 'name': 'Exit Gate', 'type': 'exit',
     'location': 'Lobby Barat', 'min_access': None, 'capacity_per_min': 80, 'status': 'active'},
]

# Wristband inventories
WRISTBAND_INV = [
    # Event 1
    {'event_short_id': 1, 'color': 'Gold',   'color_hex': '#FFD700', 'type': 'VVIP',     'total': 200,  'used': 3,  'remaining': 197},
    {'event_short_id': 1, 'color': 'Silver', 'color_hex': '#C0C0C0', 'type': 'VIP',      'total': 500,  'used': 5,  'remaining': 495},
    {'event_short_id': 1, 'color': 'Blue',   'color_hex': '#1E90FF', 'type': 'CAT 1',    'total': 1500, 'used': 5,  'remaining': 1495},
    {'event_short_id': 1, 'color': 'Green',  'color_hex': '#32CD32', 'type': 'CAT 2',    'total': 2300, 'used': 2,  'remaining': 2298},
    {'event_short_id': 1, 'color': 'Orange', 'color_hex': '#FF8C00', 'type': 'CAT 3',    'total': 3000, 'used': 2,  'remaining': 2998},
    {'event_short_id': 1, 'color': 'Red',    'color_hex': '#DC143C', 'type': 'Festival',  'total': 7500, 'used': 1,  'remaining': 7499},
    # Event 2
    {'event_short_id': 2, 'color': 'Purple', 'color_hex': '#9B59B6', 'type': 'Premium',   'total': 500,  'used': 3,  'remaining': 497},
    {'event_short_id': 2, 'color': 'Teal',   'color_hex': '#1ABC9C', 'type': 'CAT 1',    'total': 2000, 'used': 2,  'remaining': 1998},
    {'event_short_id': 2, 'color': 'Yellow', 'color_hex': '#F1C40F', 'type': 'CAT 2',    'total': 3000, 'used': 1,  'remaining': 2999},
    {'event_short_id': 2, 'color': 'Pink',   'color_hex': '#E91E63', 'type': 'Festival',  'total': 4500, 'used': 0,  'remaining': 4500},
]

# ─── Wristband mapping (type -> color) ────────────────────────────────────────

WB_MAP = {}
for wb in WRISTBAND_INV:
    WB_MAP[(wb['event_short_id'], wb['type'])] = wb['color']

# ─── Generate Orders ──────────────────────────────────────────────────────────

# Order distribution:
# Event 1 (34 orders): 25 paid, 3 pending, 2 expired, 3 cancelled, 1 refunded
# Event 2 (16 orders): 10 paid, 2 pending, 1 expired, 2 cancelled, 1 refunded

PAYMENT_TYPES = ['qris', 'bank_transfer', 'gopay', 'shopeepay']
PAYMENT_METHODS = {
    'qris': ['qris', 'gopay', 'shopeepay'],
    'bank_transfer': ['bca_va', 'mandiri_va', 'bni_va'],
    'gopay': ['gopay'],
    'shopeepay': ['shopeepay'],
}

# Global order counter to ensure unique midtrans IDs across events
_global_order_idx = 0

def gen_orders_for_event(event_short_id, counts):
    """Generate order data for an event.
    counts = {'paid': N, 'pending': N, 'expired': N, 'cancelled': N, 'refunded': N}
    """
    global _global_order_idx
    orders = []
    order_idx = 0

    # Assign participants to orders (round-robin)
    event_participants = [pid for pid in PARTICIPANT_IDS]
    rng.shuffle(event_participants)

    for status, count in counts.items():
        for i in range(count):
            p_idx = (order_idx) % len(event_participants)
            user_short_id = event_participants[p_idx]

            # Pick 1-2 ticket types for this event
            event_tts = TT_BY_EVENT[event_short_id]
            num_items = rng.randint(1, 2)
            chosen_tts = rng.sample(event_tts, min(num_items, len(event_tts)))

            order_items = []
            total_amount = 0
            for tt in chosen_tts:
                qty = rng.randint(1, 2)
                subtotal = qty * tt['price']
                total_amount += subtotal
                order_items.append({
                    'tt_short_id': tt['short_id'],
                    'quantity': qty,
                    'price_per_ticket': tt['price'],
                    'subtotal': subtotal,
                })

            platform_fee = 0
            paid_at = None
            payment_type = None
            payment_method = None
            midtrans_id = None
            expires_at = None

            if status == 'paid':
                platform_fee = calc_fee(total_amount)
                pt = rng.choice(PAYMENT_TYPES)
                payment_type = pt
                payment_method = rng.choice(PAYMENT_METHODS[pt])
                midtrans_id = gen_midtrans_id(_global_order_idx + 1)
                _global_order_idx += 1
                paid_at = f"2026-04-{rng.randint(20, 28):02d} {rng.randint(8, 20):02d}:{rng.randint(10, 59):02d}:00+07"
            elif status == 'pending':
                expires_at = "NOW() + interval '30 minutes'"
            elif status == 'expired':
                expires_at = f"2026-04-{rng.randint(10, 20):02d} {rng.randint(8, 20):02d}:{rng.randint(10, 59):02d}:00+07"
            elif status == 'refunded':
                platform_fee = 0  # was paid then refunded
                pt = rng.choice(PAYMENT_TYPES)
                payment_type = pt
                payment_method = rng.choice(PAYMENT_METHODS[pt])
                midtrans_id = gen_midtrans_id(_global_order_idx + 200)
                _global_order_idx += 1
                paid_at = f"2026-04-{rng.randint(20, 25):02d} {rng.randint(8, 18):02d}:{rng.randint(10, 59):02d}:00+07"

            orders.append({
                'order_idx': order_idx,
                'event_short_id': event_short_id,
                'user_short_id': user_short_id,
                'total_amount': total_amount,
                'status': status,
                'platform_fee': platform_fee,
                'payment_type': payment_type,
                'payment_method': payment_method,
                'midtrans_id': midtrans_id,
                'paid_at': paid_at,
                'expires_at': expires_at,
                'items': order_items,
            })
            order_idx += 1

    return orders

event1_orders = gen_orders_for_event(1, {'paid': 25, 'pending': 3, 'expired': 2, 'cancelled': 3, 'refunded': 1})
event2_orders = gen_orders_for_event(2, {'paid': 10, 'pending': 2, 'expired': 1, 'cancelled': 2, 'refunded': 1})
ALL_ORDERS = event1_orders + event2_orders

# Assign sequential order short_ids
for i, order in enumerate(ALL_ORDERS):
    order['short_id'] = i + 1

# ─── Generate Tickets (100 total) ─────────────────────────────────────────────

# Event 1 (67): 30 active, 3 pending, 10 redeemed, 7 inside, 3 outside, 7 cancelled, 7 expired
# Event 2 (33): 15 active, 2 pending, 5 redeemed, 3 inside, 2 outside, 3 cancelled, 3 expired

TICKET_DISTRIBUTION = {
    1: {'active': 30, 'pending': 3, 'redeemed': 10, 'inside': 7, 'outside': 3, 'cancelled': 7, 'expired': 7},
    2: {'active': 15, 'pending': 2, 'redeemed': 5, 'inside': 3, 'outside': 2, 'cancelled': 3, 'expired': 3},
}

def gen_seat_label(tt_name, zone, row_num=None, seat_num=None):
    """Generate a seat label based on ticket type."""
    if tt_name == 'Festival':
        return 'Festival'
    return f"{tt_name}-{zone}-{row_num}-{seat_num}"

# Track used wristband codes
used_wb_codes = set()

def unique_wb_code():
    while True:
        code = gen_wristband_code()
        if code not in used_wb_codes:
            used_wb_codes.add(code)
            return code

# Track used ticket codes
used_ticket_codes = set()

def unique_ticket_code():
    while True:
        code = gen_ticket_code()
        if code not in used_ticket_codes:
            used_ticket_codes.add(code)
            return code

def gen_tickets_for_event(event_short_id, distribution, event_orders):
    """Generate tickets for an event based on the distribution."""
    tickets = []
    ticket_seq = 0

    # Get paid orders for this event (these generate active/redeemed/inside/outside tickets)
    # Get pending orders for pending tickets
    # Get cancelled orders for cancelled tickets
    # Get expired orders for expired tickets
    # Get refunded orders for cancelled (refunded) tickets

    # We need to map orders to ticket statuses
    # Strategy: assign ticket statuses to orders, then create tickets from order items

    paid_orders = [o for o in event_orders if o['status'] == 'paid']
    pending_orders = [o for o in event_orders if o['status'] == 'pending']
    expired_orders = [o for o in event_orders if o['status'] == 'expired']
    cancelled_orders = [o for o in event_orders if o['status'] == 'cancelled']
    refunded_orders = [o for o in event_orders if o['status'] == 'refunded']

    # For paid orders: tickets can be active, redeemed, inside, outside
    # For pending orders: tickets are pending
    # For expired orders: tickets are expired
    # For cancelled orders: tickets are cancelled
    # For refunded orders: tickets are cancelled

    # Assign statuses to individual tickets
    status_list = []
    for status, count in distribution.items():
        status_list.extend([status] * count)

    # Now create tickets by picking from orders
    # We need to produce exactly the right number of tickets per status

    # Build a pool of "ticket slots" from orders
    # Each order item creates 1-N ticket slots (quantity tickets)
    ticket_slots = []  # (order, item_index)
    for order in event_orders:
        for item_idx, item in enumerate(order['items']):
            for _ in range(item['quantity']):
                ticket_slots.append((order, item_idx))

    # We need exactly len(status_list) tickets
    # Take from the pool
    # Priority: cancelled/expired/pending orders first (their tickets match their order status)
    # Then fill remaining from paid orders

    # Simple approach: build tickets directly from the distribution
    # For each status, pick appropriate orders

    event_tts = TT_BY_EVENT[event_short_id]
    event_title = [e['title'] for e in EVENTS if e['short_id'] == event_short_id][0]

    # Track which row/seat we've used for seat labels
    seat_counters = {}  # tt_short_id -> next_row
    for tt in event_tts:
        seat_counters[tt['short_id']] = 1

    # Staff IDs for redemptions
    counter_staff_ids = [10, 11, 12]
    gate_staff_ids = [20, 21, 22, 23]

    # Counter IDs for this event
    event_counters = [c for c in COUNTERS if c['event_short_id'] == event_short_id]
    event_gates = [g for g in GATES if g['event_short_id'] == event_short_id]

    # Get the participant list for this event's orders
    event_user_ids = list(set(o['user_short_id'] for o in event_orders))

    # Create tickets by iterating through the distribution
    ticket_idx = 0
    assigned_tickets = []

    # First, handle tickets from specific order types
    # Pending tickets from pending orders
    # Cancelled tickets from cancelled/refunded orders
    # Expired tickets from expired orders
    # Active/redeemed/inside/outside from paid orders

    # We'll assign from orders proportionally
    def get_order_for_status(status):
        """Get an appropriate order for a ticket status."""
        if status == 'pending':
            pool = pending_orders
        elif status == 'expired':
            pool = expired_orders
        elif status == 'cancelled':
            pool = cancelled_orders + refunded_orders
        else:  # active, redeemed, inside, outside
            pool = paid_orders
        if not pool:
            pool = paid_orders  # fallback
        return pool

    # We need to track how many tickets each order has produced
    order_ticket_count = {}  # order_short_id -> count

    for status in status_list:
        pool = get_order_for_status(status)

        # Pick an order, trying to distribute evenly
        # Use ticket_idx for round-robin
        order = pool[ticket_idx % len(pool)]

        # Pick a ticket type from this order's items
        item = order['items'][ticket_idx % len(order['items'])]
        tt_short = item['tt_short_id']
        tt = TT_MAP[tt_short]

        user_short = order['user_short_id']
        _, email, name = USER_MAP[user_short]

        ticket_code = unique_ticket_code()
        qr_data = ticket_code

        # Generate seat label
        tt_name = tt['name']
        zone = tt['zone']
        if tt_name == 'Festival':
            seat_label = 'Festival'
        else:
            row = seat_counters[tt_short] // 20 + 1
            seat_num = seat_counters[tt_short] % 20 + 1
            seat_counters[tt_short] += 1
            seat_label = gen_seat_label(tt_name, zone, row, seat_num)

        # Wristband code for redeemed/inside/outside
        wristband_code = None
        redeemed_at = None
        redeemed_by = None

        if status in ('redeemed', 'inside', 'outside'):
            wristband_code = unique_wb_code()
            staff_short = rng.choice(counter_staff_ids)
            redeemed_by = user_id(staff_short)
            hour = rng.randint(16, 19)
            minute = rng.randint(0, 59)
            redeemed_at = f"2026-04-28 {hour:02d}:{minute:02d}:00+07"

        assigned_tickets.append({
            'event_short_id': event_short_id,
            'order_short_id': order['short_id'],
            'tt_short_id': tt_short,
            'user_short_id': user_short,
            'ticket_code': ticket_code,
            'qr_data': qr_data,
            'attendee_name': name,
            'attendee_email': email,
            'seat_label': seat_label,
            'event_title': event_title,
            'ticket_type_name': tt_name,
            'status': status,
            'wristband_code': wristband_code,
            'redeemed_at': redeemed_at,
            'redeemed_by': redeemed_by,
        })

        ticket_idx += 1

    return assigned_tickets

event1_tickets = gen_tickets_for_event(1, TICKET_DISTRIBUTION[1], event1_orders)
event2_tickets = gen_tickets_for_event(2, TICKET_DISTRIBUTION[2], event2_orders)
ALL_TICKETS = event1_tickets + event2_tickets

# Assign sequential ticket short_ids
for i, ticket in enumerate(ALL_TICKETS):
    ticket['short_id'] = i + 1

# ─── Generate Redemptions (30 total) ──────────────────────────────────────────

def gen_redemptions(tickets):
    """Generate redemptions for tickets with status redeemed, inside, or outside."""
    redemptions = []
    redeemable = [t for t in tickets if t['status'] in ('redeemed', 'inside', 'outside')]

    for ticket in redeemable:
        event_short = ticket['event_short_id']
        event_counters = [c for c in COUNTERS if c['event_short_id'] == event_short]
        counter = rng.choice(event_counters)

        # Find wristband color from inventory
        wb_color = WB_MAP.get((event_short, ticket['ticket_type_name']), 'Unknown')

        # Staff from the redeemed_by
        if ticket['redeemed_by']:
            staff_uuid = ticket['redeemed_by']
        else:
            staff_uuid = user_id(rng.choice([10, 11, 12]))

        redemptions.append({
            'ticket_short_id': ticket['short_id'],
            'counter_short_id': counter['short_id'],
            'staff_uuid': staff_uuid,
            'wristband_code': ticket['wristband_code'],
            'wristband_color': wb_color,
            'wristband_type': ticket['ticket_type_name'],
            'redeemed_at': ticket['redeemed_at'] or '2026-04-28 17:00:00+07',
        })

    return redemptions

ALL_REDEMPTIONS = gen_redemptions(ALL_TICKETS)

# ─── Generate Gate Logs (50 total) ────────────────────────────────────────────

# Event 1 (35): entry(20), exit(8), denied(5), error(2)
# Event 2 (15): entry(8), exit(4), denied(2), error(1)
# For inside tickets: must have entry log
# For outside tickets: must have entry + exit log
# scanned_at on 2026-04-28 between 17:00-22:00+07

def gen_gate_logs(tickets):
    """Generate gate logs based on tickets."""
    logs = []

    # Separate tickets by event
    event1_tickets_list = [t for t in tickets if t['event_short_id'] == 1]
    event2_tickets_list = [t for t in tickets if t['event_short_id'] == 2]

    def gen_for_event(ev_tickets, counts):
        ev_logs = []
        event_short = ev_tickets[0]['event_short_id'] if ev_tickets else 1
        event_gates = [g for g in GATES if g['event_short_id'] == event_short]
        gate_staff_ids_short = [20, 21, 22, 23]

        # First, handle inside tickets (must have entry log)
        inside_tickets = [t for t in ev_tickets if t['status'] == 'inside']
        outside_tickets = [t for t in ev_tickets if t['status'] == 'outside']

        entry_count = 0
        exit_count = 0

        # Inside tickets get entry logs
        for ticket in inside_tickets:
            if entry_count >= counts['entry']:
                break
            gate = rng.choice([g for g in event_gates if g['type'] in ('entry', 'both')])
            staff_short = rng.choice(gate_staff_ids_short)
            hour = rng.randint(17, 21)
            minute = rng.randint(0, 59)
            wb_note = f"Wristband verified - {ticket['ticket_type_name']}"
            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'entry',
                'notes': wb_note,
                'scanned_at': f"2026-04-28 {hour:02d}:{minute:02d}:00+07",
            })
            entry_count += 1

        # Outside tickets get entry + exit logs
        for ticket in outside_tickets:
            gate_entry = rng.choice([g for g in event_gates if g['type'] in ('entry', 'both')])
            gate_exit = rng.choice([g for g in event_gates if g['type'] in ('exit', 'both')])
            staff_short = rng.choice(gate_staff_ids_short)
            entry_hour = rng.randint(17, 20)
            entry_minute = rng.randint(0, 59)
            exit_hour = entry_hour + rng.randint(0, 1)
            exit_minute = rng.randint(0, 59)

            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate_entry['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'entry',
                'notes': f"Entry scan - {ticket['ticket_type_name']}",
                'scanned_at': f"2026-04-28 {entry_hour:02d}:{entry_minute:02d}:00+07",
            })
            entry_count += 1

            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate_exit['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'exit',
                'notes': f"Exit scan - {ticket['ticket_type_name']}",
                'scanned_at': f"2026-04-28 {exit_hour:02d}:{exit_minute:02d}:00+07",
            })
            exit_count += 1

        # Fill remaining entry logs from active/redeemed tickets
        remaining_entry = counts['entry'] - entry_count
        other_tickets = [t for t in ev_tickets if t['status'] in ('active', 'redeemed')]
        for i in range(min(remaining_entry, len(other_tickets))):
            ticket = other_tickets[i]
            gate = rng.choice([g for g in event_gates if g['type'] in ('entry', 'both')])
            staff_short = rng.choice(gate_staff_ids_short)
            hour = rng.randint(17, 21)
            minute = rng.randint(0, 59)
            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'entry',
                'notes': f"Entry scan - {ticket['ticket_type_name']}",
                'scanned_at': f"2026-04-28 {hour:02d}:{minute:02d}:00+07",
            })

        # Fill remaining exit logs
        remaining_exit = counts['exit'] - exit_count
        for i in range(remaining_exit):
            ticket = rng.choice(other_tickets) if other_tickets else rng.choice(ev_tickets)
            gate = rng.choice([g for g in event_gates if g['type'] in ('exit', 'both')])
            staff_short = rng.choice(gate_staff_ids_short)
            hour = rng.randint(19, 22)
            minute = rng.randint(0, 59)
            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'exit',
                'notes': f"Exit scan - {ticket['ticket_type_name']}",
                'scanned_at': f"2026-04-28 {hour:02d}:{minute:02d}:00+07",
            })

        # Denied logs
        for i in range(counts['denied']):
            ticket = rng.choice(ev_tickets)
            gate = rng.choice(event_gates)
            staff_short = rng.choice(gate_staff_ids_short)
            hour = rng.randint(17, 21)
            minute = rng.randint(0, 59)
            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'denied',
                'notes': f"Invalid ticket - {ticket['ticket_type_name']}",
                'scanned_at': f"2026-04-28 {hour:02d}:{minute:02d}:00+07",
            })

        # Error logs
        for i in range(counts['error']):
            ticket = rng.choice(ev_tickets)
            gate = rng.choice(event_gates)
            staff_short = rng.choice(gate_staff_ids_short)
            hour = rng.randint(17, 21)
            minute = rng.randint(0, 59)
            ev_logs.append({
                'ticket_short_id': ticket['short_id'],
                'gate_short_id': gate['short_id'],
                'staff_uuid': user_id(staff_short),
                'event_short_id': event_short,
                'action': 'error',
                'notes': 'Scanner malfunction',
                'scanned_at': f"2026-04-28 {hour:02d}:{minute:02d}:00+07",
            })

        return ev_logs

    e1_logs = gen_for_event(event1_tickets_list, {'entry': 20, 'exit': 8, 'denied': 5, 'error': 2})
    e2_logs = gen_for_event(event2_tickets_list, {'entry': 8, 'exit': 4, 'denied': 2, 'error': 1})

    return e1_logs + e2_logs

ALL_GATE_LOGS = gen_gate_logs(ALL_TICKETS)

# ─── Generate Audit Logs (15) ─────────────────────────────────────────────────

AUDIT_ACTIONS = [
    ('LOGIN', 'auth', 'User u001 logged in from 192.168.1.10'),
    ('LOGIN', 'auth', 'User u002 logged in from 192.168.1.20'),
    ('LOGIN', 'auth', 'User u003 logged in from 192.168.1.30'),
    ('LOGIN', 'auth', 'User u010 logged in from 10.0.0.5'),
    ('LOGIN', 'auth', 'User u020 logged in from 10.0.0.15'),
    ('CANCEL_TICKET', 'tickets', 'Ticket tk005 cancelled by admin u001'),
    ('CANCEL_TICKET', 'tickets', 'Ticket tk012 cancelled by admin u001'),
    ('CANCEL_TICKET', 'tickets', 'Ticket tk023 cancelled by organizer u002'),
    ('CREATE_EVENT', 'events', 'Event e001 created by u002'),
    ('CREATE_EVENT', 'events', 'Event e002 created by u002'),
    ('UPDATE_SETTINGS', 'settings', 'Tenant settings updated by u001'),
    ('UPDATE_SETTINGS', 'settings', 'Fee percentage updated by u001'),
    ('EXPIRE_TICKETS', 'tickets', '7 tickets expired by system (user u001)'),
    ('EXPIRE_TICKETS', 'tickets', '3 tickets expired by system (user u001)'),
    ('REFUND_ORDER', 'orders', 'Order o015 refunded by admin u001'),
]

# ─── Generate Notifications (30) ──────────────────────────────────────────────

NOTIF_CATEGORIES = ['order', 'payment', 'redemption', 'gate', 'system']
NOTIF_TYPES = ['info', 'success', 'warning', 'error']

NOTIF_TEMPLATES = {
    'order': [
        ('Pesanan Berhasil Dibuat', 'Pesanan Anda telah berhasil dibuat. Silakan lakukan pembayaran.'),
        ('Tiket Anda Sudah Aktif', 'Tiket Anda sudah aktif. Jangan lupa tukar dengan wristband di counter!'),
        ('Pesanan Dibatalkan', 'Pesanan Anda telah dibatalkan.'),
    ],
    'payment': [
        ('Pembayaran Berhasil!', 'Pembayaran Anda telah dikonfirmasi. Tiket sudah aktif.'),
        ('Menunggu Pembayaran', 'Pesanan Anda sedang menunggu pembayaran. Selesaikan dalam 30 menit!'),
        ('Pembayaran Gagal', 'Pembayaran Anda gagal diproses. Silakan coba lagi.'),
        ('Refund Diproses', 'Pengembalian dana Anda sedang diproses.'),
    ],
    'redemption': [
        ('Wristband Tersedia', 'Tiket Anda sudah bisa ditukar dengan wristband di counter.'),
        ('Wristband Berhasil Ditukar', 'Wristband Anda telah berhasil ditukar. Selamat menikmati!'),
    ],
    'gate': [
        ('Selamat Datang!', 'Anda telah memasuki venue. Selamat menikmati konser!'),
        ('Akses Ditolak', 'Tiket Anda tidak valid untuk gate ini. Silakan hubungi petugas.'),
        ('Anda Telah Keluar', 'Anda telah keluar dari venue. Terima kasih telah hadir!'),
    ],
    'system': [
        ('Pemeliharaan Sistem', 'Sistem akan mengalami pemeliharaan pada pukul 02:00 WIB.'),
        ('Update Aplikasi', 'Versi terbaru aplikasi sudah tersedia. Silakan update.'),
        ('Selamat Datang di SeleEvent!', 'Akun Anda telah berhasil dibuat. Mulai jelajahi event!'),
    ],
}

def gen_notifications(count=30):
    notifs = []
    for i in range(count):
        category = NOTIF_CATEGORIES[i % len(NOTIF_CATEGORIES)]
        template = rng.choice(NOTIF_TEMPLATES[category])
        title, message = template

        # Determine type based on category and content
        if 'Berhasil' in title or 'Selamat' in title:
            ntype = 'success'
        elif 'Gagal' in title or 'Ditolak' in title or 'Dibatalkan' in title:
            ntype = 'error'
        elif 'Menunggu' in title or 'Pemeliharaan' in title:
            ntype = 'warning'
        else:
            ntype = 'info'

        # Pick a user
        user_short = rng.choice(PARTICIPANT_IDS)
        # Pick an event
        event_short = rng.choice([1, 2])
        is_read = rng.choice([True, False])

        notifs.append({
            'user_short_id': user_short,
            'event_short_id': event_short,
            'title': title,
            'message': message,
            'type': ntype,
            'category': category,
            'is_read': is_read,
        })

    return notifs

ALL_NOTIFICATIONS = gen_notifications(30)

# ─── Counter Staff (Event 2) ──────────────────────────────────────────────────

COUNTER_STAFF_E2 = [
    {'user_short_id': 10, 'counter_short_id': 4, 'shift': 'Siang (15:00-18:00)'},
    {'user_short_id': 11, 'counter_short_id': 5, 'shift': 'Malam (18:00-21:00)'},
]

# ─── Gate Staff (Event 2) ─────────────────────────────────────────────────────

GATE_STAFF_E2 = [
    {'user_short_id': 20, 'gate_short_id': 6, 'shift': 'Malam (17:00-23:00)'},
    {'user_short_id': 21, 'gate_short_id': 7, 'shift': 'Malam (17:00-23:00)'},
    {'user_short_id': 22, 'gate_short_id': 8, 'shift': 'Malam (17:00-23:00)'},
]

# ─── SQL Generation ────────────────────────────────────────────────────────────

def generate_sql():
    lines = []
    def w(text=''):
        lines.append(text)

    w("-- ============================================================================")
    w("-- SeleEvent — Comprehensive Seed Data")
    w("-- Sheila On 7 Concert Tour (Jakarta + Bandung)")
    w("-- ============================================================================")
    w("-- Generated by generate_seed.py")
    w("-- Run AFTER schema.sql has been applied.")
    w("-- ============================================================================")
    w()

    # ─── DELETE statements (FK order) ─────────────────────────────────────
    w("-- ─── Clean existing data (respect FK order) ──────────────────────────────────")
    w("DELETE FROM audit_logs;")
    w("DELETE FROM notifications;")
    w("DELETE FROM gate_logs;")
    w("DELETE FROM redemptions;")
    w("DELETE FROM gate_staff;")
    w("DELETE FROM counter_staff;")
    w("DELETE FROM tickets;")
    w("DELETE FROM order_items;")
    w("DELETE FROM orders;")
    w("DELETE FROM seats;")
    w("DELETE FROM wristband_inventories;")
    w("DELETE FROM ticket_types;")
    w("DELETE FROM counters;")
    w("DELETE FROM gates;")
    w("DELETE FROM events;")
    w("DELETE FROM tenant_users;")
    w("DELETE FROM subscriptions;")
    w("DELETE FROM invoices;")
    w("DELETE FROM users;")
    w("DELETE FROM tenants;")
    w()

    # ─── 1. TENANT ────────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 1. TENANT")
    w("-- ============================================================================")
    w()
    w(f"INSERT INTO tenants (id, name, slug, primary_color, secondary_color, is_active, max_events, max_tickets, plan, fee_percentage) VALUES")
    w(f"('{tenant_id(1)}', 'SeleEvent', 'seleevent', '#00A39D', '#F8AD3C', true, 5, 15000, 'free', 3.00);")
    w()

    # ─── 2. SUBSCRIPTION ──────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 2. SUBSCRIPTION (trial)")
    w("-- ============================================================================")
    w()
    w(f"INSERT INTO subscriptions (id, tenant_id, plan, status, current_period_start, current_period_end) VALUES")
    w(f"('{sub_id(1)}', '{tenant_id(1)}', 'free', 'trial', '2026-04-01', '2026-07-01');")
    w()

    # ─── 3. USERS ─────────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 3. USERS — Staff & participants")
    w("-- ============================================================================")
    w()

    # Group users by role for readability
    roles = {}
    for uid, role, email, name in USERS:
        roles.setdefault(role, []).append((uid, email, name))

    for role, users_in_role in roles.items():
        w(f"-- {role}")
        w("INSERT INTO users (id, google_id, email, name, role, status) VALUES")
        values = []
        for uid, email, name in users_in_role:
            gid = f"mock-{role.lower()}-{uid:03d}"
            values.append(f"('{user_id(uid)}', '{gid}', '{esc(email)}', '{esc(name)}', '{role}', 'active')")
        w(',\n'.join(values) + ';')
        w()

    # ─── 4. TENANT_USERS ──────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 4. TENANT_USERS (membership links)")
    w("-- ============================================================================")
    w()
    w("INSERT INTO tenant_users (user_id, tenant_id, role, is_active) VALUES")
    w(f"('{user_id(1)}', '{tenant_id(1)}', 'SUPER_ADMIN', true),")
    w(f"('{user_id(2)}', '{tenant_id(1)}', 'ORGANIZER', true),")
    w(f"('{user_id(3)}', '{tenant_id(1)}', 'ORGANIZER', true);")
    w()

    # ─── 5. EVENTS ────────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 5. EVENTS")
    w("-- ============================================================================")
    w()
    w("INSERT INTO events (id, tenant_id, slug, title, subtitle, date, doors_open, venue, city, address, capacity, status) VALUES")
    ev_values = []
    for ev in EVENTS:
        ev_values.append(
            f"('{event_id(ev['short_id'])}', '{tenant_id(1)}', '{ev['slug']}', "
            f"'{esc(ev['title'])}', '{esc(ev['subtitle'])}', "
            f"'{ev['date']}', '{ev['doors_open']}', "
            f"'{esc(ev['venue'])}', '{esc(ev['city'])}', '{esc(ev['address'])}', "
            f"{ev['capacity']}, '{ev['status']}')"
        )
    w(',\n'.join(ev_values) + ';')
    w()

    # ─── 6. TICKET TYPES ──────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 6. TICKET TYPES")
    w("-- ============================================================================")
    w()
    w("INSERT INTO ticket_types (id, tenant_id, event_id, name, description, price, quota, sold, tier, zone, emoji, benefits) VALUES")
    tt_values = []
    for tt in TICKET_TYPES:
        tt_values.append(
            f"('{tt_id(tt['short_id'])}', '{tenant_id(1)}', '{event_id(tt['event_short_id'])}', "
            f"'{esc(tt['name'])}', '{esc(tt['desc'])}', "
            f"{tt['price']}, {tt['quota']}, {tt['sold']}, "
            f"'{tt['tier']}', '{tt['zone']}', '{tt['emoji']}', "
            f"'{esc(tt['benefits'])}')"
        )
    w(',\n'.join(tt_values) + ';')
    w()

    # ─── 7. SEATS ─────────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 7. SEATS — Using generate_series for bulk insert")
    w("-- ============================================================================")
    w()

    # Event 1: VVIP(A,10×20), VIP(B,10×50), CAT1(C,15×100)
    w("-- Event 1: VVIP seats (zone A, 10 rows × 20 cols = 200 seats)")
    w("INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)")
    w("SELECT")
    w("    gen_random_uuid(),")
    w(f"    '{tenant_id(1)}',")
    w(f"    '{event_id(1)}',")
    w(f"    '{tt_id(1)}',")
    w("    'A',")
    w("    r.row_num::text,")
    w("    c.col_num::text,")
    w("    'A-' || r.row_num::text || '-' || c.col_num::text,")
    w("    CASE WHEN random() < 0.85 THEN 'sold' ELSE 'available' END")
    w("FROM generate_series(1, 10) AS r(row_num)")
    w("CROSS JOIN generate_series(1, 20) AS c(col_num);")
    w()

    w("-- Event 1: VIP seats (zone B, 10 rows × 50 cols = 500 seats)")
    w("INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)")
    w("SELECT")
    w("    gen_random_uuid(),")
    w(f"    '{tenant_id(1)}',")
    w(f"    '{event_id(1)}',")
    w(f"    '{tt_id(2)}',")
    w("    'B',")
    w("    r.row_num::text,")
    w("    c.col_num::text,")
    w("    'B-' || r.row_num::text || '-' || c.col_num::text,")
    w("    CASE WHEN random() < 0.80 THEN 'sold' ELSE 'available' END")
    w("FROM generate_series(1, 10) AS r(row_num)")
    w("CROSS JOIN generate_series(1, 50) AS c(col_num);")
    w()

    w("-- Event 1: CAT 1 seats (zone C, 15 rows × 100 cols = 1500 seats)")
    w("INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)")
    w("SELECT")
    w("    gen_random_uuid(),")
    w(f"    '{tenant_id(1)}',")
    w(f"    '{event_id(1)}',")
    w(f"    '{tt_id(3)}',")
    w("    'C',")
    w("    r.row_num::text,")
    w("    c.col_num::text,")
    w("    'C-' || r.row_num::text || '-' || c.col_num::text,")
    w("    CASE WHEN random() < 0.70 THEN 'sold' ELSE 'available' END")
    w("FROM generate_series(1, 15) AS r(row_num)")
    w("CROSS JOIN generate_series(1, 100) AS c(col_num);")
    w()

    # Event 2: Premium(P,10×50)
    w("-- Event 2: Premium seats (zone P, 10 rows × 50 cols = 500 seats)")
    w("INSERT INTO seats (id, tenant_id, event_id, ticket_type_id, section, row, number, label, status)")
    w("SELECT")
    w("    gen_random_uuid(),")
    w(f"    '{tenant_id(1)}',")
    w(f"    '{event_id(2)}',")
    w(f"    '{tt_id(7)}',")
    w("    'P',")
    w("    r.row_num::text,")
    w("    c.col_num::text,")
    w("    'P-' || r.row_num::text || '-' || c.col_num::text,")
    w("    CASE WHEN random() < 0.80 THEN 'sold' ELSE 'available' END")
    w("FROM generate_series(1, 10) AS r(row_num)")
    w("CROSS JOIN generate_series(1, 50) AS c(col_num);")
    w()

    # ─── 8. COUNTERS ──────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 8. COUNTERS — Wristband redemption booths")
    w("-- ============================================================================")
    w()
    w("INSERT INTO counters (id, tenant_id, event_id, name, location, capacity, status, open_at, close_at) VALUES")
    c_values = []
    for c in COUNTERS:
        c_values.append(
            f"('{counter_id(c['short_id'])}', '{tenant_id(1)}', '{event_id(c['event_short_id'])}', "
            f"'{esc(c['name'])}', '{esc(c['location'])}', {c['capacity']}, '{c['status']}', "
            f"'{c['open_at']}', '{c['close_at']}')"
        )
    w(',\n'.join(c_values) + ';')
    w()

    # ─── 9. GATES ─────────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 9. GATES — Entry/exit points")
    w("-- ============================================================================")
    w()
    w("INSERT INTO gates (id, tenant_id, event_id, name, type, location, min_access_level, capacity_per_min, status) VALUES")
    g_values = []
    for g in GATES:
        min_access = f"'{g['min_access']}'" if g['min_access'] else 'NULL'
        g_values.append(
            f"('{gate_id(g['short_id'])}', '{tenant_id(1)}', '{event_id(g['event_short_id'])}', "
            f"'{esc(g['name'])}', '{g['type']}', '{esc(g['location'])}', "
            f"{min_access}, {g['capacity_per_min']}, '{g['status']}')"
        )
    w(',\n'.join(g_values) + ';')
    w()

    # ─── 10. COUNTER STAFF ────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 10. COUNTER STAFF ASSIGNMENTS")
    w("-- ============================================================================")
    w()
    w("-- Event 1 counter staff")
    w("INSERT INTO counter_staff (tenant_id, user_id, counter_id, shift, status) VALUES")
    w(f"('{tenant_id(1)}', '{user_id(10)}', '{counter_id(1)}', 'Siang (15:00-18:00)', 'active'),")
    w(f"('{tenant_id(1)}', '{user_id(11)}', '{counter_id(2)}', 'Siang (15:00-18:00)', 'active'),")
    w(f"('{tenant_id(1)}', '{user_id(12)}', '{counter_id(3)}', 'Malam (18:00-21:00)', 'active');")
    w()
    w("-- Event 2 counter staff")
    w("INSERT INTO counter_staff (tenant_id, user_id, counter_id, shift, status) VALUES")
    cs_values = []
    for cs in COUNTER_STAFF_E2:
        cs_values.append(
            f"('{tenant_id(1)}', '{user_id(cs['user_short_id'])}', '{counter_id(cs['counter_short_id'])}', "
            f"'{esc(cs['shift'])}', 'active')"
        )
    w(',\n'.join(cs_values) + ';')
    w()

    # ─── 11. GATE STAFF ───────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 11. GATE STAFF ASSIGNMENTS")
    w("-- ============================================================================")
    w()
    w("-- Event 1 gate staff")
    w("INSERT INTO gate_staff (tenant_id, user_id, gate_id, shift, status) VALUES")
    w(f"('{tenant_id(1)}', '{user_id(20)}', '{gate_id(1)}', 'Malam (17:00-23:00)', 'active'),")
    w(f"('{tenant_id(1)}', '{user_id(21)}', '{gate_id(2)}', 'Malam (17:00-23:00)', 'active'),")
    w(f"('{tenant_id(1)}', '{user_id(22)}', '{gate_id(3)}', 'Malam (17:00-23:00)', 'active'),")
    w(f"('{tenant_id(1)}', '{user_id(23)}', '{gate_id(4)}', 'Malam (17:00-23:00)', 'active');")
    w()
    w("-- Event 2 gate staff")
    w("INSERT INTO gate_staff (tenant_id, user_id, gate_id, shift, status) VALUES")
    gs_values = []
    for gs in GATE_STAFF_E2:
        gs_values.append(
            f"('{tenant_id(1)}', '{user_id(gs['user_short_id'])}', '{gate_id(gs['gate_short_id'])}', "
            f"'{esc(gs['shift'])}', 'active')"
        )
    w(',\n'.join(gs_values) + ';')
    w()

    # ─── 12. WRISTBAND INVENTORIES ────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 12. WRISTBAND INVENTORIES")
    w("-- ============================================================================")
    w()
    w("INSERT INTO wristband_inventories (tenant_id, event_id, color, color_hex, type, total_stock, used_stock, remaining_stock) VALUES")
    wb_values = []
    for wb in WRISTBAND_INV:
        wb_values.append(
            f"('{tenant_id(1)}', '{event_id(wb['event_short_id'])}', "
            f"'{wb['color']}', '{wb['color_hex']}', '{wb['type']}', "
            f"{wb['total']}, {wb['used']}, {wb['remaining']})"
        )
    w(',\n'.join(wb_values) + ';')
    w()

    # ─── 13. ORDERS ───────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 13. ORDERS")
    w("-- ============================================================================")
    w()

    # Group by event and status for readability
    for event_short in [1, 2]:
        ev_orders = [o for o in ALL_ORDERS if o['event_short_id'] == event_short]
        ev_title = [e['title'] for e in EVENTS if e['short_id'] == event_short][0]
        w(f"-- Event {event_short}: {esc(ev_title)}")

        # Group by status
        by_status = {}
        for o in ev_orders:
            by_status.setdefault(o['status'], []).append(o)

        for status in ['paid', 'pending', 'expired', 'cancelled', 'refunded']:
            if status not in by_status:
                continue
            status_orders = by_status[status]
            w(f"-- {status.upper()} orders ({len(status_orders)})")

            o_values = []
            for o in status_orders:
                cols = [f"'{order_id(o['short_id'])}'", f"'{tenant_id(1)}'",
                        f"'{gen_order_code(o['short_id'])}'",
                        f"'{user_id(o['user_short_id'])}'",
                        f"'{event_id(o['event_short_id'])}'",
                        str(o['total_amount']),
                        f"'{o['status']}'"]

                # Add optional fields
                if o['payment_type']:
                    cols.append(f"'{o['payment_type']}'")
                else:
                    cols.append('NULL')

                if o['payment_method']:
                    cols.append(f"'{o['payment_method']}'")
                else:
                    cols.append('NULL')

                if o['midtrans_id']:
                    cols.append(f"'{o['midtrans_id']}'")
                else:
                    cols.append('NULL')

                cols.append(str(o['platform_fee']))

                if o['expires_at']:
                    cols.append(f"'{o['expires_at']}'" if not o['expires_at'].startswith('NOW()') else o['expires_at'])
                else:
                    cols.append('NULL')

                if o['paid_at']:
                    cols.append(f"'{o['paid_at']}'")
                else:
                    cols.append('NULL')

                o_values.append('(' + ', '.join(cols) + ')')

            w("INSERT INTO orders (id, tenant_id, order_code, user_id, event_id, total_amount, status, payment_type, payment_method, midtrans_transaction_id, platform_fee, expires_at, paid_at) VALUES")
            w(',\n'.join(o_values) + ';')
            w()

    # ─── 14. ORDER ITEMS ──────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 14. ORDER ITEMS")
    w("-- ============================================================================")
    w()

    oi_values = []
    for o in ALL_ORDERS:
        for item in o['items']:
            oi_values.append(
                f"('{tenant_id(1)}', '{order_id(o['short_id'])}', '{tt_id(item['tt_short_id'])}', "
                f"{item['quantity']}, {item['price_per_ticket']}, {item['subtotal']})"
            )

    # Split into batches for readability
    batch_size = 20
    for i in range(0, len(oi_values), batch_size):
        batch = oi_values[i:i+batch_size]
        w("INSERT INTO order_items (tenant_id, order_id, ticket_type_id, quantity, price_per_ticket, subtotal) VALUES")
        w(',\n'.join(batch) + ';')
        w()

    # ─── 15. TICKETS ──────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 15. TICKETS")
    w("-- ============================================================================")
    w()

    # Group by event
    for event_short in [1, 2]:
        ev_tickets = [t for t in ALL_TICKETS if t['event_short_id'] == event_short]
        ev_title = [e['title'] for e in EVENTS if e['short_id'] == event_short][0]
        w(f"-- Event {event_short}: {esc(ev_title)}")

        # Group by status for readability
        by_status = {}
        for t in ev_tickets:
            by_status.setdefault(t['status'], []).append(t)

        for status in ['active', 'pending', 'redeemed', 'inside', 'outside', 'cancelled', 'expired']:
            if status not in by_status:
                continue
            status_tickets = by_status[status]
            w(f"-- {status.upper()} tickets ({len(status_tickets)})")

            t_values = []
            for t in status_tickets:
                cols = [
                    f"'{ticket_id(t['short_id'])}'",
                    f"'{tenant_id(1)}'",
                    f"'{order_id(t['order_short_id'])}'",
                    f"'{tt_id(t['tt_short_id'])}'",
                    f"'{event_id(t['event_short_id'])}'",
                    f"'{t['ticket_code']}'",
                    f"'{esc(t['attendee_name'])}'",
                    f"'{esc(t['attendee_email'])}'",
                    f"'{esc(t['seat_label'])}'",
                    f"'{t['qr_data']}'",
                ]

                # wristband_code
                if t['wristband_code']:
                    cols.append(f"'{t['wristband_code']}'")
                else:
                    cols.append('NULL')

                cols.append(f"'{esc(t['event_title'])}'")
                cols.append(f"'{esc(t['ticket_type_name'])}'")
                cols.append(f"'{t['status']}'")

                # redeemed_at
                if t['redeemed_at']:
                    cols.append(f"'{t['redeemed_at']}'")
                else:
                    cols.append('NULL')

                # redeemed_by
                if t['redeemed_by']:
                    cols.append(f"'{t['redeemed_by']}'")
                else:
                    cols.append('NULL')

                t_values.append('(' + ', '.join(cols) + ')')

            # Split large batches - each batch needs its own INSERT INTO header
            for j in range(0, len(t_values), 15):
                batch = t_values[j:j+15]
                w("INSERT INTO tickets (id, tenant_id, order_id, ticket_type_id, event_id, ticket_code, attendee_name, attendee_email, seat_label, qr_data, wristband_code, event_title, ticket_type_name, status, redeemed_at, redeemed_by) VALUES")
                w(',\n'.join(batch) + ';')
                if j + 15 < len(t_values):
                    w()  # Extra spacing between batches
        w()

    # ─── 16. REDEMPTIONS ──────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 16. REDEMPTIONS")
    w("-- ============================================================================")
    w()
    r_values = []
    for r in ALL_REDEMPTIONS:
        r_values.append(
            f"('{tenant_id(1)}', '{ticket_id(r['ticket_short_id'])}', "
            f"'{counter_id(r['counter_short_id'])}', '{r['staff_uuid']}', "
            f"'{r['wristband_code']}', '{r['wristband_color']}', '{r['wristband_type']}', "
            f"NULL, '{r['redeemed_at']}')"
        )
    # Split into batches - each batch needs its own INSERT INTO header
    for i in range(0, len(r_values), 15):
        batch = r_values[i:i+15]
        w("INSERT INTO redemptions (tenant_id, ticket_id, counter_id, staff_id, wristband_code, wristband_color, wristband_type, notes, redeemed_at) VALUES")
        w(',\n'.join(batch) + ';')
        if i + 15 < len(r_values):
            w()
    w()

    # ─── 17. GATE LOGS ────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 17. GATE LOGS")
    w("-- ============================================================================")
    w()
    gl_values = []
    for gl in ALL_GATE_LOGS:
        gl_values.append(
            f"(gen_random_uuid(), '{tenant_id(1)}', '{ticket_id(gl['ticket_short_id'])}', "
            f"'{gate_id(gl['gate_short_id'])}', '{gl['staff_uuid']}', "
            f"'{event_id(gl['event_short_id'])}', '{gl['action']}', "
            f"'{esc(gl['notes'])}', '{gl['scanned_at']}')"
        )
    for i in range(0, len(gl_values), 15):
        batch = gl_values[i:i+15]
        w("INSERT INTO gate_logs (id, tenant_id, ticket_id, gate_id, staff_id, event_id, action, notes, scanned_at) VALUES")
        w(',\n'.join(batch) + ';')
        if i + 15 < len(gl_values):
            w()
    w()

    # ─── 18. AUDIT LOGS ───────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 18. AUDIT LOGS")
    w("-- ============================================================================")
    w()
    w("INSERT INTO audit_logs (id, tenant_id, user_id, action, module, details, ip, created_at) VALUES")
    al_values = []
    admin_ids = [1, 2, 3]
    for i, (action, module, details) in enumerate(AUDIT_ACTIONS):
        uid = admin_ids[i % len(admin_ids)]
        created = f"2026-04-{rng.randint(20, 28):02d} {rng.randint(8, 20):02d}:{rng.randint(10, 59):02d}:00+07"
        al_values.append(
            f"(gen_random_uuid(), '{tenant_id(1)}', '{user_id(uid)}', "
            f"'{action}', '{module}', '{esc(details)}', "
            f"'192.168.{rng.randint(1, 10)}.{rng.randint(1, 254)}', '{created}')"
        )
    w(',\n'.join(al_values) + ';')
    w()

    # ─── 19. NOTIFICATIONS ────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- 19. NOTIFICATIONS")
    w("-- ============================================================================")
    w()
    n_values = []
    for n in ALL_NOTIFICATIONS:
        n_values.append(
            f"(gen_random_uuid(), '{tenant_id(1)}', '{user_id(n['user_short_id'])}', "
            f"'{event_id(n['event_short_id'])}', '{esc(n['title'])}', '{esc(n['message'])}', "
            f"'{n['type']}', '{n['category']}', {'true' if n['is_read'] else 'false'})"
        )
    for i in range(0, len(n_values), 15):
        batch = n_values[i:i+15]
        w("INSERT INTO notifications (id, tenant_id, user_id, event_id, title, message, type, category, is_read) VALUES")
        w(',\n'.join(batch) + ';')
        if i + 15 < len(n_values):
            w()
    w()

    # ─── Summary ──────────────────────────────────────────────────────────
    w("-- ============================================================================")
    w("-- SEED DATA SUMMARY")
    w("-- ============================================================================")
    w(f"--   1 Tenant (SeleEvent)")
    w(f"--   1 Subscription (trial)")
    w(f"--   {len(USERS)} Users")
    w(f"--   3 TenantUsers")
    w(f"--   {len(EVENTS)} Events")
    w(f"--   {len(TICKET_TYPES)} Ticket Types")
    w(f"--   Seats (generate_series)")
    w(f"--   {len(COUNTERS)} Counters")
    w(f"--   {len(GATES)} Gates")
    w(f"--   {len(COUNTER_STAFF_E2) + 3} Counter Staff assignments")
    w(f"--   {len(GATE_STAFF_E2) + 4} Gate Staff assignments")
    w(f"--   {len(WRISTBAND_INV)} Wristband Inventory records")
    w(f"--   {len(ALL_ORDERS)} Orders")
    w(f"--   {sum(len(o['items']) for o in ALL_ORDERS)} Order Items")
    w(f"--   {len(ALL_TICKETS)} Tickets")
    w(f"--   {len(ALL_REDEMPTIONS)} Redemptions")
    w(f"--   {len(ALL_GATE_LOGS)} Gate Logs")
    w(f"--   {len(AUDIT_ACTIONS)} Audit Logs")
    w(f"--   {len(ALL_NOTIFICATIONS)} Notifications")
    w("-- ============================================================================")

    return '\n'.join(lines)


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed-data.sql')
    sql = generate_sql()
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sql)
    print(f"Generated seed-data.sql ({len(sql)} bytes, {sql.count(chr(10))} lines)")
    print(f"  Orders: {len(ALL_ORDERS)}")
    print(f"  Order Items: {sum(len(o['items']) for o in ALL_ORDERS)}")
    print(f"  Tickets: {len(ALL_TICKETS)}")
    print(f"  Redemptions: {len(ALL_REDEMPTIONS)}")
    print(f"  Gate Logs: {len(ALL_GATE_LOGS)}")
    print(f"  Audit Logs: {len(AUDIT_ACTIONS)}")
    print(f"  Notifications: {len(ALL_NOTIFICATIONS)}")
