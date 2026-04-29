// ─── SELEEVENT MOCK DATA ──────────────────────────────────────────────────────
// Comprehensive mock data for Sheila On 7 — JAKARTA concert ticketing system
// Used when the Golang Fiber backend is unavailable during development
//
// 100 tickets across all ticket types, internally consistent with:
// - Matching orders (each ticket belongs to an order)
// - Matching users (each order belongs to a user)
// - Aggregated dashboard KPIs based on full event statistics
// - Supporting data for all admin pages (gates, counters, staff, logs, etc.)

import type {
  IUser,
  IEvent,
  ITicketType,
  IOrder,
  IOrderItem,
  ITicket,
  ICounter,
  ICounterDashboard,
  IGate,
  IGateDashboard,
  IGateStaff,
  ICounterStaff,
  IGateLog,
  IRedemption,
  IVerificationItem,
  IDashboardKPIs,
  ILiveStats,
  IWristbandConfig,
} from './types'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000'
const EVENT_ID = 'evt-so7-jakarta-2026'
const EVENT_DATE = '2026-04-25'

// ─── INDONESIAN NAMES ────────────────────────────────────────────────────────

const PARTICIPANT_NAMES = [
  'Ahmad Rizky Pratama', 'Siti Nurhaliza Putri', 'Budi Santoso', 'Dewi Lestari',
  'Eko Prasetyo', 'Fitriani Wulandari', 'Galih Ramadhan', 'Hana Safira',
  'Irfan Hakim', 'Jasmine Azzahra', 'Kemal Fauzi', 'Larasati Dewi',
  'Muhammad Farhan', 'Nadira Zahra', 'Oscar Firmansyah', 'Putri Amelia',
  'Rizal Aditya Nugroho', 'Sari Indah Permata', 'Taufik Hidayat', 'Ulfa Maharani',
  'Vino Prasetya', 'Wulan Dari', 'Yoga Pratama', 'Zahra Aulia',
  'Andi Setiawan', 'Bayu Aditya', 'Citra Dewi Sartika', 'Dimas Prayoga',
  'Elsa Fitriani', 'Fajar Nugroho', 'Gita Savitri', 'Hendra Wijaya',
  'Intan Permata Sari', 'Joko Susanto', 'Kartika Sari', 'Lukman Hakim',
  'Maya Anggraini', 'Naufal Rizky', 'Oktavia Putri', 'Pandu Wijaksono',
  'Qori Ismail', 'Ratna Kusuma', 'Surya Darma', 'Tika Wulandari',
  'Umar Fadhil', 'Vera Nathania', 'Wahyu Setiabudi', 'Xena Maharani',
  'Yudha Permana', 'Zulkifli Ramadhan', 'Anisa Rahma', 'Bagus Purnomo',
  'Clara Audia', 'Doni Firmansyah', 'Eka Putra', 'Farah Nabila',
  'Gilang Mahardika', 'Hesti Rahayu', 'Iqbal Maulana', 'Julia Kartika',
  'Kevin Ardiansyah', 'Lina Marlina', 'Maulana Rizky', 'Novia Sari',
  'Omar Bakrie', 'Puspita Dewi', 'Rendi Pratama', 'Selvy Oktaviani',
]

const STAFF_NAMES = {
  superAdmin: ['Admin SeleEvent'],
  admin: ['Raka Wiratama', 'Dian Purnama'],
  organizer: ['Hendra Kusuma', 'Mega Putri Ayu'],
  counterStaff: [
    'Arif Rahman', 'Bambang Suryadi', 'Cahya Wibisono', 'Dina Fitriyanti',
    'Edwin Saladin', 'Fanni Oktaviani', 'Gunawan Wibowo', 'Hani Pratiwi',
  ],
  gateStaff: [
    'Indra Kurniawan', 'Joko Widodo S.', 'Krisna Mahendra', 'Lisa Permata',
    'Mulyono Hartono', 'Nia Ramadhani S.', 'Oki Fauzan', 'Pramudya Ananta',
  ],
}

// ─── EMAIL GENERATOR ──────────────────────────────────────────────────────────

function nameToEmail(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + '@gmail.com'
}

function nameToPhone(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const prefix = '0812'
  const suffix = String(10000000 + (hash % 90000000)).slice(0, 8)
  return prefix + suffix
}

// ─── DETERMINISTIC UUID GENERATOR ─────────────────────────────────────────────

function uuid(seed: string, index: number = 0): string {
  const s = `${seed}-${index}`
  const h = s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
  const hex = (n: number, len: number) => Math.abs(n).toString(16).padStart(len, '0').slice(0, len)
  return `${hex(h, 8)}-${hex(h * 31, 4)}-4${hex(h * 37, 3)}-${hex(h * 41, 4)}-${hex(h * 43, 12)}`
}

// ─── 1. EVENT ─────────────────────────────────────────────────────────────────

export const MOCK_EVENT: IEvent = {
  id: EVENT_ID,
  tenantId: TENANT_ID,
  slug: 'sheila-on-7-jakarta-2026',
  title: 'Sheila On 7 — JAKARTA',
  subtitle: 'Melompat Lebih Tinggi Tour 2026',
  date: EVENT_DATE,
  doorsOpen: '18:00',
  venue: 'GBK Madya Stadium',
  city: 'Jakarta',
  address: 'Jl. Pintu 1 Senayan, Gelora, Tanah Abang, Kota Jakarta Pusat, DKI Jakarta 10270',
  capacity: 18800,
  status: 'published',
  createdAt: '2025-10-01T08:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
}

// ─── 2. TICKET TYPES ──────────────────────────────────────────────────────────

export const MOCK_TICKET_TYPES: ITicketType[] = [
  {
    id: 'tt-vvip', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'VVIP PIT', description: 'Akses VIP terdepan dengan panggung',
    price: 3500000, quota: 300, sold: 247, tier: 'floor', zone: 'Floor - VVIP',
    emoji: '👑', benefits: ['Meet & Greet', 'Exclusive Merchandise', 'Priority Entry', 'Welcome Drink'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-vip', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'VIP ZONE', description: 'Area standing VIP di depan panggung',
    price: 2800000, quota: 500, sold: 412, tier: 'floor', zone: 'Floor - VIP',
    emoji: '⭐', benefits: ['Priority Entry', 'Exclusive Lanyard', 'Merchandise Voucher'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-festival', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'FESTIVAL', description: 'Area standing festival',
    price: 2200000, quota: 3000, sold: 2150, tier: 'floor', zone: 'Floor - Festival',
    emoji: '🎵', benefits: ['Free Entry Festival Area'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-cat1', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'CAT 1', description: 'Tribun Barat Lantai 1 — Kursi bernomor',
    price: 1750000, quota: 2000, sold: 1780, tier: 'tribun', zone: 'Tribun Barat Lt.1',
    emoji: '💺', benefits: ['Kursi bernomor', 'Pemandangan bagus'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-cat2', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'CAT 2', description: 'Tribun Timur Lantai 1 — Kursi bernomor',
    price: 1400000, quota: 3000, sold: 2410, tier: 'tribun', zone: 'Tribun Timur Lt.1',
    emoji: '💺', benefits: ['Kursi bernomor'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-cat3', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'CAT 3', description: 'Tribun Barat Lantai 2 — Kursi bernomor',
    price: 1100000, quota: 3000, sold: 1950, tier: 'tribun', zone: 'Tribun Barat Lt.2',
    emoji: '💺', benefits: ['Kursi bernomor'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-cat4', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'CAT 4', description: 'Tribun Timur Lantai 2 — Kursi bernomor',
    price: 850000, quota: 4000, sold: 2680, tier: 'tribun', zone: 'Tribun Timur Lt.2',
    emoji: '💺', benefits: ['Kursi bernomor'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-cat5', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'CAT 5', description: 'Tribun Barat Lantai 3 — Kursi bernomor',
    price: 550000, quota: 3000, sold: 1520, tier: 'tribun', zone: 'Tribun Barat Lt.3',
    emoji: '💺', benefits: ['Kursi bernomor'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'tt-cat6', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'CAT 6', description: 'Tribun Timur Lantai 3 — Kursi bernomor',
    price: 350000, quota: 2500, sold: 890, tier: 'tribun', zone: 'Tribun Timur Lt.3',
    emoji: '💺', benefits: ['Kursi bernomor'],
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-03-20T14:30:00Z',
  },
]

// ─── 3. USERS ─────────────────────────────────────────────────────────────────

function createParticipantUser(name: string, idx: number): IUser {
  return {
    id: uuid('user', idx),
    googleId: `google-${idx}`,
    email: nameToEmail(name),
    name,
    phone: nameToPhone(name),
    role: 'PARTICIPANT',
    status: 'active',
    lastLoginAt: new Date(2026, 2, 10 + (idx % 15), 8 + (idx % 12), idx % 60).toISOString(),
    createdAt: new Date(2025, 9 + (idx % 5), 1 + (idx % 28), 8, 0).toISOString(),
    updatedAt: new Date(2026, 2, 10 + (idx % 15), 12, 0).toISOString(),
  }
}

function createStaffUser(name: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'COUNTER_STAFF' | 'GATE_STAFF', idx: number): IUser {
  return {
    id: uuid('staff', idx),
    googleId: `google-staff-${idx}`,
    email: nameToEmail(name),
    name,
    phone: nameToPhone(name),
    role,
    status: 'active',
    lastLoginAt: new Date(2026, 2, 20, 9, 0).toISOString(),
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2026-03-20T09:00:00Z',
  }
}

// Build participant users (68 participants for the 100 tickets)
const _participantUsers = PARTICIPANT_NAMES.slice(0, 68).map((name, i) => createParticipantUser(name, i + 1))

// Build staff users
const _superAdminUsers = STAFF_NAMES.superAdmin.map((name, i) => createStaffUser(name, 'SUPER_ADMIN', i + 100))
const _adminUsers = STAFF_NAMES.admin.map((name, i) => createStaffUser(name, 'ADMIN', i + 110))
const _organizerUsers = STAFF_NAMES.organizer.map((name, i) => createStaffUser(name, 'ORGANIZER', i + 120))
const _counterStaffUsers = STAFF_NAMES.counterStaff.map((name, i) => createStaffUser(name, 'COUNTER_STAFF', i + 130))
const _gateStaffUsers = STAFF_NAMES.gateStaff.map((name, i) => createStaffUser(name, 'GATE_STAFF', i + 140))

export const MOCK_USERS: IUser[] = [
  ..._participantUsers,
  ..._superAdminUsers,
  ..._adminUsers,
  ..._organizerUsers,
  ..._counterStaffUsers,
  ..._gateStaffUsers,
]

// ─── 4. ORDERS, ORDER ITEMS, AND TICKETS ──────────────────────────────────────
//
// 100 tickets distributed as:
//   VVIP: 3, VIP: 5, FESTIVAL: 25, CAT1: 15, CAT2: 18, CAT3: 13, CAT4: 12, CAT5: 6, CAT6: 3
//
// Status distribution:
//   active: 70, redeemed: 15, inside: 5, pending: 5, expired: 5
//
// Orders:
//   - paid: 72 orders → 84 tickets (64 active + 15 redeemed + 5 inside)
//   - pending: 5 orders → 6 tickets (6 pending)
//   - expired: 3 orders → 4 tickets (4 expired)
//   - cancelled: 3 orders → 6 tickets (1 expired + 5 expired — we'll just use expired for simplicity)
// Total: 83 orders, 100 tickets

const PAYMENT_METHODS = [
  'QRIS - GoPay', 'QRIS - OVO', 'QRIS - Dana', 'QRIS - ShopeePay',
  'QRIS - BSI', 'Transfer BSI', 'Transfer Mandiri', 'QRIS - LinkAja',
]

type TicketAllocation = {
  ticketTypeId: string
  ticketTypeName: string
  price: number
  tier: 'floor' | 'tribun'
  count: number
}

const TICKET_ALLOCATIONS: TicketAllocation[] = [
  { ticketTypeId: 'tt-vvip', ticketTypeName: 'VVIP PIT', price: 3500000, tier: 'floor', count: 3 },
  { ticketTypeId: 'tt-vip', ticketTypeName: 'VIP ZONE', price: 2800000, tier: 'tribun', count: 5 },
  { ticketTypeId: 'tt-festival', ticketTypeName: 'FESTIVAL', price: 2200000, tier: 'floor', count: 25 },
  { ticketTypeId: 'tt-cat1', ticketTypeName: 'CAT 1', price: 1750000, tier: 'tribun', count: 15 },
  { ticketTypeId: 'tt-cat2', ticketTypeName: 'CAT 2', price: 1400000, tier: 'tribun', count: 18 },
  { ticketTypeId: 'tt-cat3', ticketTypeName: 'CAT 3', price: 1100000, tier: 'tribun', count: 13 },
  { ticketTypeId: 'tt-cat4', ticketTypeName: 'CAT 4', price: 850000, tier: 'tribun', count: 12 },
  { ticketTypeId: 'tt-cat5', ticketTypeName: 'CAT 5', price: 550000, tier: 'tribun', count: 6 },
  { ticketTypeId: 'tt-cat6', ticketTypeName: 'CAT 6', price: 350000, tier: 'tribun', count: 3 },
]

// Build a flat list of ticket type instances
interface TicketSlot {
  ticketTypeId: string
  ticketTypeName: string
  price: number
  tier: 'floor' | 'tribun'
}

const _ticketSlots: TicketSlot[] = TICKET_ALLOCATIONS.flatMap(a =>
  Array.from({ length: a.count }, () => ({
    ticketTypeId: a.ticketTypeId,
    ticketTypeName: a.ticketTypeName,
    price: a.price,
    tier: a.tier,
  }))
)

// Assign statuses: 70 active, 15 redeemed, 5 inside, 5 pending, 5 expired
const STATUS_LIST: Array<'active' | 'redeemed' | 'inside' | 'pending' | 'expired'> = [
  ...Array<'active'>(70).fill('active'),
  ...Array<'redeemed'>(15).fill('redeemed'),
  ...Array<'inside'>(5).fill('inside'),
  ...Array<'pending'>(5).fill('pending'),
  ...Array<'expired'>(5).fill('expired'),
]

// Shuffle status assignments deterministically
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const _shuffledStatuses = seededShuffle(STATUS_LIST, 42)

// Build order groups: group tickets into orders
// Each order has 1-3 tickets. We'll create order groupings.
interface OrderGroup {
  orderIndex: number
  userIndex: number
  status: 'paid' | 'pending' | 'expired' | 'cancelled'
  paymentMethod: string
  ticketIndices: number[]
  createdAt: string
  paidAt?: string
}

const _orderGroups: OrderGroup[] = []
let ticketIdx = 0
let orderIdx = 0
let userIdx = 0

// Helper: determine order status from ticket statuses
function getOrderStatus(ticketStatuses: Array<'active' | 'redeemed' | 'inside' | 'pending' | 'expired'>): 'paid' | 'pending' | 'expired' | 'cancelled' {
  if (ticketStatuses.some(s => s === 'pending')) return 'pending'
  if (ticketStatuses.every(s => s === 'expired')) return 'expired'
  if (ticketStatuses.every(s => s === 'active' || s === 'redeemed' || s === 'inside')) return 'paid'
  return 'cancelled'
}

// Create orders: most are single-ticket, some are multi-ticket
while (ticketIdx < 100) {
  const remaining = 100 - ticketIdx
  let groupSize: number

  if (remaining <= 3) {
    groupSize = remaining
  } else {
    // ~75% single, ~20% double, ~5% triple
    const r = (orderIdx * 7 + 3) % 100
    if (r < 75) groupSize = 1
    else if (r < 95) groupSize = 2
    else groupSize = 3
    groupSize = Math.min(groupSize, remaining)
  }

  const ticketIndices = Array.from({ length: groupSize }, (_, i) => ticketIdx + i)
  const ticketStatuses = ticketIndices.map(i => _shuffledStatuses[i])
  const orderStatus = getOrderStatus(ticketStatuses)

  const daysAgo = 7 + (orderIdx % 25)
  const createdAt = new Date(2026, 2, 25 - daysAgo, 9 + (orderIdx % 14), (orderIdx * 7) % 60).toISOString()
  const paidAt = orderStatus === 'paid'
    ? new Date(2026, 2, 25 - daysAgo, 9 + (orderIdx % 14), ((orderIdx * 7) % 60) + 5).toISOString()
    : undefined

  _orderGroups.push({
    orderIndex: orderIdx,
    userIndex: userIdx,
    status: orderStatus,
    paymentMethod: orderStatus === 'paid' ? PAYMENT_METHODS[orderIdx % PAYMENT_METHODS.length] : (orderStatus === 'pending' ? PAYMENT_METHODS[(orderIdx + 3) % PAYMENT_METHODS.length] : ''),
    ticketIndices,
    createdAt,
    paidAt,
  })

  ticketIdx += groupSize
  orderIdx++
  userIdx++
}

// ─── BUILD ORDERS ─────────────────────────────────────────────────────────────

export const MOCK_ORDERS: IOrder[] = _orderGroups.map((og) => {
  const user = _participantUsers[og.userIndex % _participantUsers.length]
  const items: IOrderItem[] = []
  const totalAmount = og.ticketIndices.reduce((sum, ti) => sum + _ticketSlots[ti].price, 0)

  // Group by ticket type for order items
  const byType = new Map<string, { type: TicketSlot; count: number }>()
  for (const ti of og.ticketIndices) {
    const slot = _ticketSlots[ti]
    const existing = byType.get(slot.ticketTypeId)
    if (existing) {
      existing.count++
    } else {
      byType.set(slot.ticketTypeId, { type: slot, count: 1 })
    }
  }

  let itemIdx = 0
  const byTypeEntries = Array.from(byType.entries())
  for (const [, { type, count }] of byTypeEntries) {
    items.push({
      id: uuid('item', og.orderIndex * 10 + itemIdx),
      tenantId: TENANT_ID,
      orderId: uuid('order', og.orderIndex),
      ticketTypeId: type.ticketTypeId,
      quantity: count,
      pricePerTicket: type.price,
      subtotal: count * type.price,
      ticketType: MOCK_TICKET_TYPES.find(tt => tt.id === type.ticketTypeId),
    })
    itemIdx++
  }

  return {
    id: uuid('order', og.orderIndex),
    tenantId: TENANT_ID,
    orderCode: `SO7-${String(100001 + og.orderIndex)}`,
    userId: user.id,
    eventId: EVENT_ID,
    totalAmount,
    status: og.status,
    paymentMethod: og.paymentMethod,
    paymentType: og.paymentMethod.includes('QRIS') ? 'qris' : og.paymentMethod.includes('Transfer') ? 'bank_transfer' : '',
    paidAt: og.paidAt,
    createdAt: og.createdAt,
    updatedAt: og.paidAt || og.createdAt,
    items,
    event: MOCK_EVENT,
    user,
  }
})

// ─── BUILD TICKETS ────────────────────────────────────────────────────────────

export const MOCK_TICKETS: ITicket[] = _orderGroups.flatMap((og) => {
  const user = _participantUsers[og.userIndex % _participantUsers.length]
  const order = MOCK_ORDERS[og.orderIndex]

  return og.ticketIndices.map((ti, localIdx) => {
    const slot = _ticketSlots[ti]
    const status = _shuffledStatuses[ti]
    const ticketId = uuid('ticket', ti + 1)
    const ticketCode = `SO7-${String(ti + 1).padStart(4, '0')}-${String((ti * 37) % 10000).padStart(4, '0')}`

    const redeemedAt = (status === 'redeemed' || status === 'inside')
      ? new Date(2026, 3, 24 + (ti % 2), 10 + (ti % 8), (ti * 3) % 60).toISOString()
      : undefined

    const wristbandCode = (status === 'redeemed' || status === 'inside')
      ? `WB-${String(1000 + ti).padStart(6, '0')}`
      : undefined

    return {
      id: ticketId,
      tenantId: TENANT_ID,
      eventId: EVENT_ID,
      ticketCode,
      orderId: order.id,
      ticketTypeId: slot.ticketTypeId,
      attendeeName: user.name,
      attendeeEmail: user.email,
      qrData: `SELEEVENT:${ticketCode}`,
      status,
      redeemedAt,
      redeemedBy: (status === 'redeemed' || status === 'inside') ? STAFF_NAMES.counterStaff[ti % STAFF_NAMES.counterStaff.length] : undefined,
      wristbandCode,
      eventTitle: MOCK_EVENT.title,
      ticketTypeName: slot.ticketTypeName,
      createdAt: order.createdAt,
      updatedAt: order.paidAt || order.createdAt,
      order,
      ticketType: MOCK_TICKET_TYPES.find(tt => tt.id === slot.ticketTypeId),
      event: MOCK_EVENT,
    } as ITicket
  })
})

// ─── 5. DASHBOARD KPIs ────────────────────────────────────────────────────────
// Based on FULL event statistics (not just the 100 mock tickets)

const TOTAL_SOLD = MOCK_TICKET_TYPES.reduce((s, tt) => s + tt.sold, 0) // 14,039
const TOTAL_QUOTA = MOCK_TICKET_TYPES.reduce((s, tt) => s + tt.quota, 0) // 21,300
const TOTAL_REVENUE = MOCK_TICKET_TYPES.reduce((s, tt) => s + (tt.sold * tt.price), 0) // 18,807,600,000

export const MOCK_DASHBOARD_KPIS: IDashboardKPIs & {
  salesByTier: { name: string; terjual: number; quota: number; revenue: number; percentage: number }[]
  revenueChartData: { date: string; revenue: number; orders: number }[]
  paymentMethodBreakdown: { method: string; count: number; percentage: number }[]
} = {
  totalRevenue: TOTAL_REVENUE,
  totalTicketsSold: TOTAL_SOLD,
  totalOrders: 8347,
  paidOrders: 7890,
  pendingOrders: 287,
  totalUsers: 9120,
  totalQuota: TOTAL_QUOTA,
  ticketsRedeemed: 3840,
  ticketsInside: 2650,
  pendingVerifications: 12,
  avgVerificationTime: 4.5,
  occupancyRate: Math.round((2650 / 18800) * 100), // ~14%

  salesByTier: MOCK_TICKET_TYPES.map(tt => ({
    name: tt.name,
    terjual: tt.sold,
    quota: tt.quota,
    revenue: tt.sold * tt.price,
    percentage: Math.round((tt.sold / tt.quota) * 100),
  })),

  revenueChartData: [
    { date: '19 Mar', revenue: 2450000000, orders: 1120 },
    { date: '20 Mar', revenue: 2890000000, orders: 1345 },
    { date: '21 Mar', revenue: 3120000000, orders: 1489 },
    { date: '22 Mar', revenue: 2680000000, orders: 1278 },
    { date: '23 Mar', revenue: 3340000000, orders: 1567 },
    { date: '24 Mar', revenue: 2150000000, orders: 1034 },
    { date: '25 Mar', revenue: 2176000000, orders: 514 + MOCK_ORDERS.filter(o => o.status === 'paid').length },
  ],

  paymentMethodBreakdown: [
    { method: 'QRIS - GoPay', count: 2340, percentage: 28 },
    { method: 'QRIS - OVO', count: 1780, percentage: 21 },
    { method: 'QRIS - Dana', count: 1340, percentage: 16 },
    { method: 'QRIS - ShopeePay', count: 1005, percentage: 12 },
    { method: 'Transfer BSI', count: 835, percentage: 10 },
    { method: 'Transfer Mandiri', count: 585, percentage: 7 },
    { method: 'QRIS - BSI', count: 335, percentage: 4 },
    { method: 'QRIS - LinkAja', count: 250, percentage: 3 },
  ],
}

// ─── 6. ANALYTICS DATA ────────────────────────────────────────────────────────

export const MOCK_ANALYTICS = {
  hourlySalesData: [
    { hour: '08:00', sales: 45 }, { hour: '09:00', sales: 120 },
    { hour: '10:00', sales: 280 }, { hour: '11:00', sales: 410 },
    { hour: '12:00', sales: 520 }, { hour: '13:00', sales: 480 },
    { hour: '14:00', sales: 390 }, { hour: '15:00', sales: 350 },
    { hour: '16:00', sales: 420 }, { hour: '17:00', sales: 560 },
    { hour: '18:00', sales: 620 }, { hour: '19:00', sales: 710 },
    { hour: '20:00', sales: 540 }, { hour: '21:00', sales: 380 },
    { hour: '22:00', sales: 195 }, { hour: '23:00', sales: 65 },
  ],
  topCities: [
    { city: 'Jakarta', pct: 42 }, { city: 'Tangerang', pct: 12 },
    { city: 'Bekasi', pct: 10 }, { city: 'Depok', pct: 8 },
    { city: 'Bandung', pct: 7 }, { city: 'Bogor', pct: 5 },
    { city: 'Surabaya', pct: 4 }, { city: 'Semarang', pct: 3 },
    { city: 'Yogyakarta', pct: 3 }, { city: 'Lainnya', pct: 6 },
  ],
  ageDistribution: [
    { range: '18-24', pct: 35 }, { range: '25-34', pct: 40 },
    { range: '35-44', pct: 15 }, { range: '45+', pct: 10 },
  ],
  ticketStatusBreakdown: [
    { status: 'Active', count: TOTAL_SOLD - 3840 - 2650 - 450, percentage: 50 },
    { status: 'Redeemed', count: 3840, percentage: 27 },
    { status: 'Inside', count: 2650, percentage: 19 },
    { status: 'Pending', count: 350, percentage: 3 },
    { status: 'Expired', count: 100, percentage: 1 },
  ],
  revenueChartData: MOCK_DASHBOARD_KPIS.revenueChartData,
  salesByTier: MOCK_DASHBOARD_KPIS.salesByTier,
  paymentMethodBreakdown: MOCK_DASHBOARD_KPIS.paymentMethodBreakdown,
}

// ─── 7. GATES ─────────────────────────────────────────────────────────────────

export const MOCK_GATES: IGateDashboard[] = [
  {
    id: 'gate-a', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate A', type: 'entry', location: 'Utara - Utama',
    minAccessLevel: 'FESTIVAL', capacityPerMin: 50, status: 'active',
    staffCount: 3, totalIn: 1240, totalOut: 180, currentInside: 1060,
    lastScan: '2026-03-25T19:42:00Z',
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T19:42:00Z',
  },
  {
    id: 'gate-b', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate B', type: 'entry', location: 'Selatan - Tengah',
    minAccessLevel: 'CAT 1', capacityPerMin: 40, status: 'active',
    staffCount: 2, totalIn: 890, totalOut: 120, currentInside: 770,
    lastScan: '2026-03-25T19:38:00Z',
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T19:38:00Z',
  },
  {
    id: 'gate-c', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate C', type: 'entry', location: 'Barat - Samping',
    minAccessLevel: 'CAT 4', capacityPerMin: 35, status: 'active',
    staffCount: 2, totalIn: 670, totalOut: 95, currentInside: 575,
    lastScan: '2026-03-25T19:35:00Z',
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T19:35:00Z',
  },
  {
    id: 'gate-d', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate D', type: 'both', location: 'Timur - VVIP',
    minAccessLevel: 'VVIP PIT', capacityPerMin: 20, status: 'active',
    staffCount: 2, totalIn: 340, totalOut: 45, currentInside: 295,
    lastScan: '2026-03-25T19:40:00Z',
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T19:40:00Z',
  },
  {
    id: 'gate-e', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate E', type: 'exit', location: 'Utara - Darurat',
    minAccessLevel: 'FESTIVAL', capacityPerMin: 60, status: 'inactive',
    staffCount: 1, totalIn: 0, totalOut: 0, currentInside: 0,
    lastScan: undefined,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },
  {
    id: 'gate-f', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate F', type: 'entry', location: 'Selatan - Tribun',
    minAccessLevel: 'CAT 5', capacityPerMin: 30, status: 'active',
    staffCount: 2, totalIn: 520, totalOut: 80, currentInside: 440,
    lastScan: '2026-03-25T19:30:00Z',
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T19:30:00Z',
  },
  {
    id: 'gate-g', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Gate G', type: 'both', location: 'Barat - VIP',
    minAccessLevel: 'VIP ZONE', capacityPerMin: 25, status: 'active',
    staffCount: 2, totalIn: 410, totalOut: 60, currentInside: 350,
    lastScan: '2026-03-25T19:36:00Z',
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T19:36:00Z',
  },
]

// ─── 8. COUNTERS ──────────────────────────────────────────────────────────────

export const MOCK_COUNTERS: ICounterDashboard[] = [
  {
    id: 'counter-1', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 1', location: 'Lobby Utara', capacity: 300, status: 'active',
    openAt: '2026-04-24T08:00:00Z', closeAt: '2026-04-25T20:00:00Z',
    staffCount: 2, redeemedToday: 145,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'counter-2', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 2', location: 'Lobby Selatan', capacity: 300, status: 'active',
    openAt: '2026-04-24T08:00:00Z', closeAt: '2026-04-25T20:00:00Z',
    staffCount: 2, redeemedToday: 118,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'counter-3', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 3', location: 'Lobby Barat', capacity: 250, status: 'active',
    openAt: '2026-04-24T08:00:00Z', closeAt: '2026-04-25T20:00:00Z',
    staffCount: 1, redeemedToday: 92,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'counter-4', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 4', location: 'Lobby Timur', capacity: 250, status: 'active',
    openAt: '2026-04-24T08:00:00Z', closeAt: '2026-04-25T20:00:00Z',
    staffCount: 1, redeemedToday: 78,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'counter-5', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 5', location: 'Area VVIP', capacity: 150, status: 'active',
    openAt: '2026-04-24T10:00:00Z', closeAt: '2026-04-25T20:00:00Z',
    staffCount: 1, redeemedToday: 65,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'counter-6', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 6', location: 'Area Festival', capacity: 400, status: 'active',
    openAt: '2026-04-24T08:00:00Z', closeAt: '2026-04-25T20:00:00Z',
    staffCount: 1, redeemedToday: 210,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 'counter-7', tenantId: TENANT_ID, eventId: EVENT_ID,
    name: 'Counter 7', location: 'Lobby Utara Lt.2', capacity: 200, status: 'inactive',
    openAt: undefined, closeAt: undefined,
    staffCount: 0, redeemedToday: 0,
    createdAt: '2025-12-01T08:00:00Z', updatedAt: '2026-03-20T10:00:00Z',
  },
]

// ─── 9. STAFF (Counter + Gate) ────────────────────────────────────────────────

export const MOCK_COUNTER_STAFF: ICounterStaff[] = STAFF_NAMES.counterStaff.map((name, i) => {
  const user = _counterStaffUsers[i]
  const counter = MOCK_COUNTERS[i % 6] // first 6 counters are active
  return {
    id: uuid('cstaff', i + 1),
    tenantId: TENANT_ID,
    userId: user.id,
    counterId: counter.id,
    shift: (['pagi', 'siang', 'malam', 'full'] as const)[i % 4],
    status: 'active',
    assignedAt: '2026-03-20T08:00:00Z',
    user,
    counter,
  }
})

export const MOCK_GATE_STAFF: IGateStaff[] = STAFF_NAMES.gateStaff.map((name, i) => {
  const user = _gateStaffUsers[i]
  const gate = MOCK_GATES[i % MOCK_GATES.length]
  return {
    id: uuid('gstaff', i + 1),
    tenantId: TENANT_ID,
    userId: user.id,
    gateId: gate.id,
    shift: (['pagi', 'siang', 'malam', 'full'] as const)[i % 4],
    status: 'active',
    assignedAt: '2026-03-20T08:00:00Z',
    user,
    gate,
  }
})

// ─── 10. STAFF (for StaffManagement page — flattened) ─────────────────────────

export const MOCK_STAFF_LIST: Array<{
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  assignedLocation: string
  shift: string
  totalScans: number
  lastActive: string
}> = [
  // Super Admins
  ..._superAdminUsers.map(u => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone || '—',
    role: 'SUPER_ADMIN', status: 'active', assignedLocation: '—',
    shift: 'full', totalScans: 0, lastActive: '2026-03-25T09:00:00Z',
  })),
  // Admins
  ..._adminUsers.map(u => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone || '—',
    role: 'ADMIN', status: 'active', assignedLocation: '—',
    shift: 'full', totalScans: 0, lastActive: '2026-03-25T10:00:00Z',
  })),
  // Organizers
  ..._organizerUsers.map(u => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone || '—',
    role: 'ORGANIZER', status: 'active', assignedLocation: '—',
    shift: 'full', totalScans: 0, lastActive: '2026-03-25T11:00:00Z',
  })),
  // Counter Staff
  ...STAFF_NAMES.counterStaff.map((name, i) => {
    const counter = MOCK_COUNTERS[i % 6]
    return {
      id: _counterStaffUsers[i].id, name, email: _counterStaffUsers[i].email,
      phone: _counterStaffUsers[i].phone || '—',
      role: 'COUNTER_STAFF', status: 'active',
      assignedLocation: counter.name,
      shift: (['pagi', 'siang', 'malam', 'full'] as const)[i % 4],
      totalScans: 45 + i * 12,
      lastActive: new Date(2026, 2, 25, 14 + (i % 5), i * 7 % 60).toISOString(),
    }
  }),
  // Gate Staff
  ...STAFF_NAMES.gateStaff.map((name, i) => {
    const gate = MOCK_GATES[i % MOCK_GATES.length]
    return {
      id: _gateStaffUsers[i].id, name, email: _gateStaffUsers[i].email,
      phone: _gateStaffUsers[i].phone || '—',
      role: 'GATE_STAFF', status: 'active',
      assignedLocation: gate.name,
      shift: (['pagi', 'siang', 'malam', 'full'] as const)[i % 4],
      totalScans: 120 + i * 25,
      lastActive: new Date(2026, 2, 25, 17 + (i % 3), i * 5 % 60).toISOString(),
    }
  }),
]

// ─── 11. GATE LOGS ────────────────────────────────────────────────────────────

export const MOCK_GATE_LOGS: IGateLog[] = Array.from({ length: 25 }, (_, i) => {
  const ticket = MOCK_TICKETS[i % MOCK_TICKETS.length]
  const gate = MOCK_GATES[i % MOCK_GATES.length]
  const staffUser = _gateStaffUsers[i % _gateStaffUsers.length]
  const actions: Array<'entry' | 'exit' | 'denied'> = ['entry', 'entry', 'entry', 'entry', 'exit', 'entry', 'entry', 'entry', 'denied', 'entry']
  return {
    id: uuid('glog', i + 1),
    tenantId: TENANT_ID,
    eventId: EVENT_ID,
    ticketId: ticket.id,
    gateId: gate.id,
    staffId: staffUser.id,
    action: actions[i % actions.length],
    notes: i % 10 === 9 ? 'Ticket already inside' : undefined,
    scannedAt: new Date(2026, 2, 25, 17 + (i % 4), (i * 7) % 60).toISOString(),
  }
})

// ─── 12. REDEMPTIONS ──────────────────────────────────────────────────────────

export const MOCK_REDEMPTIONS: IRedemption[] = MOCK_TICKETS
  .filter(t => t.status === 'redeemed' || t.status === 'inside')
  .slice(0, 15)
  .map((ticket, i) => {
    const counter = MOCK_COUNTERS[i % MOCK_COUNTERS.length]
    const staffUser = _counterStaffUsers[i % _counterStaffUsers.length]
    const wristbandColors = ['Gold', 'Silver', 'Teal', 'Orange', 'Purple', 'Blue', 'Red', 'Green']
    const wristbandHexes = ['#FFD700', '#C0C0C0', '#008080', '#FF8C00', '#800080', '#0000FF', '#FF0000', '#008000']
    const colorIdx = MOCK_TICKET_TYPES.findIndex(tt => tt.id === ticket.ticketTypeId)

    return {
      id: uuid('redeem', i + 1),
      tenantId: TENANT_ID,
      ticketId: ticket.id,
      counterId: counter.id,
      staffId: staffUser.id,
      wristbandCode: ticket.wristbandCode || `WB-${String(1000 + i).padStart(6, '0')}`,
      wristbandColor: wristbandColors[colorIdx % wristbandColors.length],
      wristbandColorHex: wristbandHexes[colorIdx % wristbandHexes.length],
      wristbandType: 'Tyvek',
      notes: undefined,
      redeemedAt: ticket.redeemedAt || new Date(2026, 3, 24, 10 + (i % 6), i * 3 % 60).toISOString(),
    }
  })

// ─── 13. VERIFICATIONS ────────────────────────────────────────────────────────

export const MOCK_VERIFICATIONS: IVerificationItem[] = [
  {
    id: 'verif-001', orderCode: 'SO7-100099', userId: _participantUsers[0].id,
    userName: _participantUsers[0].name, userEmail: _participantUsers[0].email,
    totalAmount: 7000000, status: 'queued', submittedAt: '2026-03-25T18:30:00Z',
    slaMinutesLeft: 28,
  },
  {
    id: 'verif-002', orderCode: 'SO7-100100', userId: _participantUsers[1].id,
    userName: _participantUsers[1].name, userEmail: _participantUsers[1].email,
    totalAmount: 4400000, status: 'in_review', submittedAt: '2026-03-25T18:15:00Z',
    reviewedBy: _adminUsers[0].name, reviewedAt: '2026-03-25T18:25:00Z', slaMinutesLeft: 15,
  },
  {
    id: 'verif-003', orderCode: 'SO7-100101', userId: _participantUsers[2].id,
    userName: _participantUsers[2].name, userEmail: _participantUsers[2].email,
    totalAmount: 2200000, status: 'approved', submittedAt: '2026-03-25T17:00:00Z',
    reviewedBy: _adminUsers[0].name, reviewedAt: '2026-03-25T17:05:00Z', slaMinutesLeft: 0,
  },
  {
    id: 'verif-004', orderCode: 'SO7-100102', userId: _participantUsers[3].id,
    userName: _participantUsers[3].name, userEmail: _participantUsers[3].email,
    totalAmount: 5500000, status: 'queued', submittedAt: '2026-03-25T19:00:00Z',
    slaMinutesLeft: 45,
  },
  {
    id: 'verif-005', orderCode: 'SO7-100103', userId: _participantUsers[4].id,
    userName: _participantUsers[4].name, userEmail: _participantUsers[4].email,
    totalAmount: 1750000, status: 'rejected', submittedAt: '2026-03-25T16:30:00Z',
    reviewedBy: _adminUsers[1].name, reviewedAt: '2026-03-25T16:40:00Z', slaMinutesLeft: 0,
  },
]

// ─── 14. LIVE STATS ───────────────────────────────────────────────────────────

export const MOCK_LIVE_STATS: ILiveStats = {
  totalTicketsPaid: TOTAL_SOLD,
  totalRedeemed: 3840,
  totalInside: 2650,
  totalOutside: 350,
  totalExited: 1200,
  totalPending: 350,
  totalGateScans: 5280,
  totalReentries: 85,
  activeCounters: 6,
  activeGates: 6,
  totalCounterStaff: 8,
  totalGateStaff: 8,
  occupancyRate: Math.round((2650 / 18800) * 100),
  totalRevenue: TOTAL_REVENUE,
}

// ─── 15. WRISTBAND CONFIG ─────────────────────────────────────────────────────

export const MOCK_WRISTBAND_CONFIGS: IWristbandConfig[] = [
  { ticketTypeId: 'tt-vvip', ticketTypeName: 'VVIP PIT', wristbandColor: 'Gold', wristbandColorHex: '#FFD700', emoji: '👑' },
  { ticketTypeId: 'tt-vip', ticketTypeName: 'VIP ZONE', wristbandColor: 'Silver', wristbandColorHex: '#C0C0C0', emoji: '⭐' },
  { ticketTypeId: 'tt-festival', ticketTypeName: 'FESTIVAL', wristbandColor: 'Teal', wristbandColorHex: '#008080', emoji: '🎵' },
  { ticketTypeId: 'tt-cat1', ticketTypeName: 'CAT 1', wristbandColor: 'Orange', wristbandColorHex: '#FF8C00', emoji: '💺' },
  { ticketTypeId: 'tt-cat2', ticketTypeName: 'CAT 2', wristbandColor: 'Purple', wristbandColorHex: '#800080', emoji: '💺' },
  { ticketTypeId: 'tt-cat3', ticketTypeName: 'CAT 3', wristbandColor: 'Blue', wristbandColorHex: '#0000FF', emoji: '💺' },
  { ticketTypeId: 'tt-cat4', ticketTypeName: 'CAT 4', wristbandColor: 'Red', wristbandColorHex: '#FF0000', emoji: '💺' },
  { ticketTypeId: 'tt-cat5', ticketTypeName: 'CAT 5', wristbandColor: 'Green', wristbandColorHex: '#008000', emoji: '💺' },
  { ticketTypeId: 'tt-cat6', ticketTypeName: 'CAT 6', wristbandColor: 'Yellow', wristbandColorHex: '#FFFF00', emoji: '💺' },
]

// ─── 16. ADMIN USERS (with aggregated stats) ──────────────────────────────────

export const MOCK_ADMIN_USERS: Array<IUser & { totalOrders: number; totalSpent: number }> = MOCK_USERS.map(user => {
  const userOrders = MOCK_ORDERS.filter(o => o.userId === user.id && o.status === 'paid')
  return {
    ...user,
    totalOrders: MOCK_ORDERS.filter(o => o.userId === user.id).length,
    totalSpent: userOrders.reduce((sum, o) => sum + o.totalAmount, 0),
  }
})

// ─── 17. EVENTS LIST (for EventsPage) ─────────────────────────────────────────

export const MOCK_EVENTS_LIST: Array<IEvent & { ticketTypes: ITicketType[] }> = [
  {
    ...MOCK_EVENT,
    ticketTypes: MOCK_TICKET_TYPES,
  },
]

// ─── 18. TICKET STATUS SUMMARY (from mock tickets) ────────────────────────────

export const MOCK_TICKET_STATUS_SUMMARY = {
  total: MOCK_TICKETS.length,
  active: MOCK_TICKETS.filter(t => t.status === 'active').length,
  redeemed: MOCK_TICKETS.filter(t => t.status === 'redeemed').length,
  inside: MOCK_TICKETS.filter(t => t.status === 'inside').length,
  pending: MOCK_TICKETS.filter(t => t.status === 'pending').length,
  expired: MOCK_TICKETS.filter(t => t.status === 'expired').length,
  cancelled: MOCK_TICKETS.filter(t => t.status === 'cancelled').length,
}

// ─── 19. PAGINATED RESPONSE HELPERS ───────────────────────────────────────────

export function paginate<T>(data: T[], page: number = 1, perPage: number = 20) {
  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage
  return {
    data: data.slice(start, start + perPage),
    pagination: {
      total,
      page: safePage,
      perPage,
      totalPages,
    },
  }
}

// ─── 20. API MOCK RESPONSES ───────────────────────────────────────────────────
// These match the shape of the API responses that the frontend expects

export const MOCK_API_RESPONSES = {
  // Admin Dashboard
  adminDashboard: MOCK_DASHBOARD_KPIS,

  // Admin Analytics
  adminAnalytics: MOCK_ANALYTICS,

  // Admin Orders
  adminOrders: paginate(MOCK_ORDERS, 1, 20),

  // Admin Users
  adminUsers: paginate(MOCK_ADMIN_USERS, 1, 20),

  // Admin Events
  adminEvents: MOCK_EVENTS_LIST,

  // Admin Tickets
  adminTickets: paginate(MOCK_TICKETS, 1, 20),

  // Admin Staff
  adminStaff: paginate(MOCK_STAFF_LIST, 1, 20),

  // Admin Counters
  adminCounters: paginate(MOCK_COUNTERS, 1, 20),

  // Admin Gates
  adminGates: paginate(MOCK_GATES, 1, 20),

  // Admin Gate Monitoring
  adminGateMonitoring: {
    gates: MOCK_GATES,
    stats: {
      totalGates: MOCK_GATES.length,
      activeGates: MOCK_GATES.filter(g => g.status === 'active').length,
      totalIn: MOCK_GATES.reduce((s, g) => s + g.totalIn, 0),
      totalOut: MOCK_GATES.reduce((s, g) => s + g.totalOut, 0),
    },
  },

  // Admin Verifications
  adminVerifications: paginate(MOCK_VERIFICATIONS, 1, 20),

  // Admin Live Monitor
  adminLiveMonitor: MOCK_LIVE_STATS,

  // Admin Crew Gates
  adminCrewGates: paginate(MOCK_GATE_STAFF, 1, 20),
}
