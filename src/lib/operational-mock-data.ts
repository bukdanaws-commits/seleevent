// ─── OPERATIONAL MOCK DATA ─────────────────────────────────────────────────
// Counter, Gate, Staff, Redemption, Gate Log, Wristband data for D-Day operations
// Sheila On 7 "Melompat Lebih Tinggi" Tour 2025

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COUNTER_STAFF' | 'GATE_STAFF' | 'ORGANIZER' | 'PARTICIPANT'

export interface StaffUser {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: UserRole
  status: 'active' | 'inactive'
  assignedLocation: string | null
  shift: string | null
  lastActive: string
  totalScans: number
}

export interface Counter {
  id: string
  name: string
  location: string
  capacity: number
  status: 'inactive' | 'active' | 'closed'
  staffCount: number
  redeemedToday: number
  openAt: string | null
  closeAt: string | null
}

export interface Gate {
  id: string
  name: string
  type: 'entry' | 'exit' | 'both'
  location: string
  minAccessLevel: string
  capacityPerMin: number
  status: 'inactive' | 'active' | 'closed'
  staffCount: number
  totalIn: number
  totalOut: number
  currentInside: number
  lastScan: string | null
}

export interface WristbandConfig {
  ticketTypeId: string
  ticketTypeName: string
  wristbandColor: string
  wristbandColorHex: string
  wristbandType: string
  emoji: string
}

export interface Redemption {
  id: string
  ticketCode: string
  ticketType: string
  attendeeName: string
  attendeeEmail: string
  wristbandCode: string
  wristbandColor: string
  wristbandType: string
  seatLabel: string | null
  counterName: string
  staffName: string
  price: number
  redeemedAt: string
}

export interface GateLog {
  id: string
  ticketCode: string
  userName: string
  ticketType: string
  action: 'IN' | 'OUT'
  gateName: string
  gateType: 'entry' | 'exit' | 'both'
  staffName: string
  timestamp: string
  reentryCount: number
}

export interface AttendeeStatus {
  ticketCode: string
  userName: string
  ticketType: string
  wristbandCode: string | null
  seatLabel: string | null
  currentStatus: 'not_redeemed' | 'redeemed' | 'inside' | 'outside' | 'exited'
  lastAction: string
  lastActionAt: string
  gateUsed: string | null
  reentryCount: number
}

export interface RedemptionConfig {
  id: string
  eventId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  status: 'upcoming' | 'active' | 'ended'
}

// ─── WRISTBAND CONFIG ───────────────────────────────────────────────────────

export const wristbandConfigs: WristbandConfig[] = [
  { ticketTypeId: 'tt-vvip', ticketTypeName: 'VVIP PIT', wristbandColor: 'Gold', wristbandColorHex: '#FFD700', wristbandType: 'VVIP Premium (Gold Embossed)', emoji: '👑' },
  { ticketTypeId: 'tt-vip', ticketTypeName: 'VIP ZONE', wristbandColor: 'Teal', wristbandColorHex: '#008080', wristbandType: 'VIP (Teal Embossed)', emoji: '⭐' },
  { ticketTypeId: 'tt-festival', ticketTypeName: 'FESTIVAL', wristbandColor: 'Orange', wristbandColorHex: '#FF6B35', wristbandType: 'Festival (Woven)', emoji: '🎵' },
  { ticketTypeId: 'tt-cat1', ticketTypeName: 'CAT 1', wristbandColor: 'Merah', wristbandColorHex: '#DC2626', wristbandType: 'CAT 1 (Fabric)', emoji: '🎟️' },
  { ticketTypeId: 'tt-cat2', ticketTypeName: 'CAT 2', wristbandColor: 'Biru', wristbandColorHex: '#2563EB', wristbandType: 'CAT 2 (Fabric)', emoji: '🎫' },
  { ticketTypeId: 'tt-cat3', ticketTypeName: 'CAT 3', wristbandColor: 'Hijau', wristbandColorHex: '#16A34A', wristbandType: 'CAT 3 (Fabric)', emoji: '🎫' },
  { ticketTypeId: 'tt-cat4', ticketTypeName: 'CAT 4', wristbandColor: 'Ungu', wristbandColorHex: '#9333EA', wristbandType: 'CAT 4 (Fabric)', emoji: '🎟️' },
  { ticketTypeId: 'tt-cat5', ticketTypeName: 'CAT 5', wristbandColor: 'Putih', wristbandColorHex: '#E5E7EB', wristbandType: 'CAT 5 (Paper)', emoji: '🎟️' },
]

// ─── COUNTERS ────────────────────────────────────────────────────────────────

export const mockCounters: Counter[] = [
  { id: 'ctr-001', name: 'Counter 1', location: 'Lobby Utara - Kiri', capacity: 500, status: 'active', staffCount: 2, redeemedToday: 187, openAt: '2025-05-17T08:00:00', closeAt: null },
  { id: 'ctr-002', name: 'Counter 2', location: 'Lobby Utara - Kanan', capacity: 500, status: 'active', staffCount: 2, redeemedToday: 203, openAt: '2025-05-17T08:00:00', closeAt: null },
  { id: 'ctr-003', name: 'Counter 3', location: 'Lobby Timur - Kiri', capacity: 400, status: 'active', staffCount: 2, redeemedToday: 156, openAt: '2025-05-17T08:00:00', closeAt: null },
  { id: 'ctr-004', name: 'Counter 4', location: 'Lobby Timur - Kanan', capacity: 400, status: 'active', staffCount: 1, redeemedToday: 134, openAt: '2025-05-17T08:30:00', closeAt: null },
  { id: 'ctr-005', name: 'Counter 5', location: 'Lobby Barat', capacity: 300, status: 'active', staffCount: 2, redeemedToday: 178, openAt: '2025-05-17T08:00:00', closeAt: null },
  { id: 'ctr-006', name: 'Counter 6', location: 'Lobby Selatan', capacity: 350, status: 'active', staffCount: 1, redeemedToday: 112, openAt: '2025-05-17T09:00:00', closeAt: null },
  { id: 'ctr-007', name: 'VIP Counter', location: 'VIP Lounge Area', capacity: 200, status: 'active', staffCount: 2, redeemedToday: 89, openAt: '2025-05-17T07:30:00', closeAt: null },
  { id: 'ctr-008', name: 'Counter 8', location: 'Parkir Barat', capacity: 300, status: 'inactive', staffCount: 0, redeemedToday: 0, openAt: null, closeAt: null },
  { id: 'ctr-009', name: 'Counter 9', location: 'Parkir Timur', capacity: 300, status: 'inactive', staffCount: 0, redeemedToday: 0, openAt: null, closeAt: null },
  { id: 'ctr-010', name: 'Counter 10', location: 'Emergency Booth', capacity: 100, status: 'inactive', staffCount: 0, redeemedToday: 0, openAt: null, closeAt: null },
  { id: 'ctr-011', name: 'Counter 11', location: 'Lobby Utara - Tengah', capacity: 500, status: 'active', staffCount: 1, redeemedToday: 95, openAt: '2025-05-24T14:00:00', closeAt: null },
  { id: 'ctr-012', name: 'Counter 12', location: 'Gerai Makanan', capacity: 150, status: 'closed', staffCount: 0, redeemedToday: 45, openAt: '2025-05-17T08:00:00', closeAt: '2025-05-24T12:00:00' },
]

// ─── GATES ───────────────────────────────────────────────────────────────────

export const mockGates: Gate[] = [
  { id: 'gate-a', name: 'Gate A', type: 'entry', location: 'Utara - Kiri', minAccessLevel: 'FESTIVAL', capacityPerMin: 30, status: 'active', staffCount: 2, totalIn: 2340, totalOut: 0, currentInside: 0, lastScan: '2025-05-24T18:05:00' },
  { id: 'gate-b', name: 'Gate B', type: 'entry', location: 'Utara - Kanan', minAccessLevel: 'FESTIVAL', capacityPerMin: 30, status: 'active', staffCount: 2, totalIn: 2180, totalOut: 0, currentInside: 0, lastScan: '2025-05-24T18:04:00' },
  { id: 'gate-c', name: 'Gate C', type: 'entry', location: 'Timur', minAccessLevel: 'CAT 3', capacityPerMin: 25, status: 'active', staffCount: 1, totalIn: 1560, totalOut: 0, currentInside: 0, lastScan: '2025-05-24T18:06:00' },
  { id: 'gate-d', name: 'Gate D', type: 'exit', location: 'Selatan - Kiri', minAccessLevel: 'FESTIVAL', capacityPerMin: 20, status: 'active', staffCount: 1, totalIn: 0, totalOut: 680, currentInside: 0, lastScan: '2025-05-24T18:03:00' },
  { id: 'gate-e', name: 'Gate E', type: 'both', location: 'Selatan - Tengah', minAccessLevel: 'FESTIVAL', capacityPerMin: 40, status: 'active', staffCount: 2, totalIn: 0, totalOut: 420, currentInside: 0, lastScan: '2025-05-24T18:02:00' },
  { id: 'vip-gate', name: 'VIP Gate', type: 'entry', location: 'Barat - VIP Area', minAccessLevel: 'VIP ZONE', capacityPerMin: 15, status: 'active', staffCount: 2, totalIn: 480, totalOut: 0, currentInside: 0, lastScan: '2025-05-24T18:05:00' },
  { id: 'exit-main', name: 'Exit Utama', type: 'exit', location: 'Selatan - Utama', minAccessLevel: 'FESTIVAL', capacityPerMin: 50, status: 'inactive', staffCount: 0, totalIn: 0, totalOut: 0, currentInside: 0, lastScan: null },
  { id: 'gate-f', name: 'Gate F', type: 'entry', location: 'Barat - Kiri', minAccessLevel: 'CAT 4', capacityPerMin: 25, status: 'active', staffCount: 1, totalIn: 890, totalOut: 0, currentInside: 0, lastScan: '2025-05-24T17:58:00' },
]

// ─── STAFF ───────────────────────────────────────────────────────────────────

export const mockStaffUsers: StaffUser[] = [
  // Counter Staff
  { id: 'cs-001', name: 'Rina Wulandari', email: 'rina.w@gmail.com', phone: '081200006666', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 1', shift: 'pagi', lastActive: '2025-05-24T16:30:00', totalScans: 187 },
  { id: 'cs-002', name: 'Fajar Nugroho', email: 'fajar.n@gmail.com', phone: '081200007777', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 1', shift: 'pagi', lastActive: '2025-05-24T16:28:00', totalScans: 156 },
  { id: 'cs-003', name: 'Mega Safitri', email: 'mega.s@gmail.com', phone: '081200008888', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 2', shift: 'pagi', lastActive: '2025-05-24T16:25:00', totalScans: 203 },
  { id: 'cs-004', name: 'Hendra Setiawan', email: 'hendra.s@gmail.com', phone: '081200009999', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 2', shift: 'pagi', lastActive: '2025-05-24T16:20:00', totalScans: 134 },
  { id: 'cs-005', name: 'Teguh Prasetyo', email: 'teguh.p@gmail.com', phone: '081200010000', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 3', shift: 'pagi', lastActive: '2025-05-24T16:15:00', totalScans: 156 },
  { id: 'cs-006', name: 'Diana Permata', email: 'diana.p@gmail.com', phone: '081200010001', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 3', shift: 'pagi', lastActive: '2025-05-24T16:10:00', totalScans: 98 },
  { id: 'cs-007', name: 'Agus Riyanto', email: 'agus.r@gmail.com', phone: '081200010002', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 4', shift: 'pagi', lastActive: '2025-05-24T16:05:00', totalScans: 134 },
  { id: 'cs-008', name: 'Lina Marlina', email: 'lina.m@gmail.com', phone: '081200010003', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 5', shift: 'pagi', lastActive: '2025-05-24T16:00:00', totalScans: 178 },
  { id: 'cs-009', name: 'Wahyu Hidayat', email: 'wahyu.h@gmail.com', phone: '081200010004', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 5', shift: 'pagi', lastActive: '2025-05-24T15:55:00', totalScans: 112 },
  { id: 'cs-010', name: 'Ratna Sari', email: 'ratna.s@gmail.com', phone: '081200010005', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'Counter 6', shift: 'pagi', lastActive: '2025-05-24T15:50:00', totalScans: 112 },
  { id: 'cs-011', name: 'Putri Ayu', email: 'putri.a@gmail.com', phone: '081200010006', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'VIP Counter', shift: 'pagi', lastActive: '2025-05-24T15:45:00', totalScans: 89 },
  { id: 'cs-012', name: 'Kevin Anggara', email: 'kevin.a@gmail.com', phone: '081200010007', avatar: '', role: 'COUNTER_STAFF', status: 'active', assignedLocation: 'VIP Counter', shift: 'pagi', lastActive: '2025-05-24T15:40:00', totalScans: 67 },
  { id: 'cs-013', name: 'Galang Ramadhan', email: 'galang.r@gmail.com', phone: '081200010008', avatar: '', role: 'COUNTER_STAFF', status: 'inactive', assignedLocation: null, shift: null, lastActive: '2025-05-23T18:00:00', totalScans: 45 },
  { id: 'cs-014', name: 'Tania Putri', email: 'tania.p@gmail.com', phone: '081200010009', avatar: '', role: 'COUNTER_STAFF', status: 'inactive', assignedLocation: null, shift: null, lastActive: '2025-05-23T17:00:00', totalScans: 30 },
  // Gate Staff
  { id: 'gs-001', name: 'Bayu Aditya', email: 'bayu.a@gmail.com', phone: '081200020001', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate A', shift: 'malam', lastActive: '2025-05-24T18:05:00', totalScans: 2340 },
  { id: 'gs-002', name: 'Sinta Dewi', email: 'sinta.d@gmail.com', phone: '081200020002', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate A', shift: 'malam', lastActive: '2025-05-24T18:04:00', totalScans: 1890 },
  { id: 'gs-003', name: 'Doni Firmansyah', email: 'doni.f@gmail.com', phone: '081200020003', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate B', shift: 'malam', lastActive: '2025-05-24T18:04:00', totalScans: 2180 },
  { id: 'gs-004', name: 'Citra Kirana', email: 'citra.k@gmail.com', phone: '081200020004', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate B', shift: 'malam', lastActive: '2025-05-24T18:03:00', totalScans: 1650 },
  { id: 'gs-005', name: 'Eko Prasetya', email: 'eko.p@gmail.com', phone: '081200020005', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate C', shift: 'malam', lastActive: '2025-05-24T18:06:00', totalScans: 1560 },
  { id: 'gs-006', name: 'Winda Sari', email: 'winda.s@gmail.com', phone: '081200020006', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate D', shift: 'malam', lastActive: '2025-05-24T18:03:00', totalScans: 680 },
  { id: 'gs-007', name: 'Oscar Pratama', email: 'oscar.p@gmail.com', phone: '081200020007', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate E', shift: 'malam', lastActive: '2025-05-24T18:02:00', totalScans: 420 },
  { id: 'gs-008', name: 'Nadira Zahra', email: 'nadira.z@gmail.com', phone: '081200020008', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'VIP Gate', shift: 'malam', lastActive: '2025-05-24T18:05:00', totalScans: 480 },
  { id: 'gs-009', name: 'Yoga Adi', email: 'yoga.a@gmail.com', phone: '081200020009', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'VIP Gate', shift: 'malam', lastActive: '2025-05-24T18:04:00', totalScans: 390 },
  { id: 'gs-010', name: 'Shela Maharani', email: 'shela.m@gmail.com', phone: '081200020010', avatar: '', role: 'GATE_STAFF', status: 'active', assignedLocation: 'Gate F', shift: 'malam', lastActive: '2025-05-24T17:58:00', totalScans: 890 },
  { id: 'gs-011', name: 'Reza Arap', email: 'reza.a@gmail.com', phone: '081200020011', avatar: '', role: 'GATE_STAFF', status: 'inactive', assignedLocation: null, shift: null, lastActive: '2025-05-23T21:00:00', totalScans: 120 },
  { id: 'gs-012', name: 'Bella Nova', email: 'bella.n@gmail.com', phone: '081200020012', avatar: '', role: 'GATE_STAFF', status: 'inactive', assignedLocation: null, shift: null, lastActive: '2025-05-23T20:00:00', totalScans: 85 },
]

// ─── REDEMPTIONS (Wristband Exchange History) ───────────────────────────────

export const mockRedemptions: Redemption[] = (() => {
  const names = ['Budi Santoso', 'Sari Dewi', 'Ahmad Hidayat', 'Fitri Handayani', 'Rudi Hartono', 'Yuliana Putri', 'Dimas Arya', 'Ani Rahayu', 'Indah Permatasari', 'Kevin Anggara', 'Tania Putri', 'Yoga Adi']
  const emails = names.map(n => `${n.toLowerCase().replace(/\s/g, '.')}@gmail.com`)
  const ticketTypes = ['VVIP PIT', 'VIP ZONE', 'FESTIVAL', 'CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5']
  const prices = [3500000, 2800000, 2200000, 1750000, 1400000, 1100000, 850000, 550000]
  const counterStaff = ['Rina Wulandari', 'Fajar Nugroho', 'Mega Safitri', 'Hendra Setiawan', 'Teguh Prasetyo', 'Diana Permata', 'Agus Riyanto', 'Lina Marlina', 'Putri Ayu', 'Kevin Anggara']
  const counters = ['Counter 1', 'Counter 2', 'Counter 3', 'Counter 4', 'Counter 5', 'Counter 6', 'VIP Counter']

  const seatLabels: Record<string, string[]> = {
    'VVIP PIT': ['V1', 'V2', 'V5', 'V8', 'V10', 'V3'],
    'VIP ZONE': ['P1', 'P5', 'P10', 'P12', 'P3', 'P8'],
    'CAT 1': ['A1', 'A5', 'A10', 'A15', 'B2', 'B7'],
    'CAT 2': ['B1', 'B10', 'C3', 'C12', 'B5', 'C8'],
    'CAT 3': ['C1', 'C10', 'D5', 'D20', 'C15', 'D12'],
    'CAT 4': ['D1', 'D15', 'E5', 'E25', 'D10', 'E18'],
    'CAT 5': ['E1', 'E10', 'F5', 'F20', 'E15', 'F12'],
  }

  const rows: string[][] = [
    ['WB-00001', 'WB-00002', 'WB-00003', 'WB-00004', 'WB-00005', 'WB-00006', 'WB-00007', 'WB-00008'],
    ['WB-00009', 'WB-00010', 'WB-00011', 'WB-00012', 'WB-00013', 'WB-00014', 'WB-00015', 'WB-00016'],
    ['WB-00017', 'WB-00018', 'WB-00019', 'WB-00020', 'WB-00021', 'WB-00022', 'WB-00023', 'WB-00024'],
    ['WB-00025', 'WB-00026', 'WB-00027', 'WB-00028', 'WB-00029', 'WB-00030', 'WB-00031', 'WB-00032'],
    ['WB-00033', 'WB-00034', 'WB-00035', 'WB-00036', 'WB-00037', 'WB-00038', 'WB-00039', 'WB-00040'],
    ['WB-00041', 'WB-00042', 'WB-00043', 'WB-00044', 'WB-00045', 'WB-00046', 'WB-00047', 'WB-00048'],
    ['WB-00049', 'WB-00050', 'WB-00051', 'WB-00052', 'WB-00053', 'WB-00054', 'WB-00055', 'WB-00056'],
    ['WB-00057', 'WB-00058', 'WB-00059', 'WB-00060', 'WB-00061', 'WB-00062', 'WB-00063', 'WB-00064'],
    ['WB-00065', 'WB-00066', 'WB-00067', 'WB-00068', 'WB-00069', 'WB-00070', 'WB-00071', 'WB-00072'],
    ['WB-00073', 'WB-00074', 'WB-00075', 'WB-00076', 'WB-00077', 'WB-00078', 'WB-00079', 'WB-00080'],
  ]

  const redemptions: Redemption[] = []
  let wbIdx = 0

  for (let i = 0; i < 80; i++) {
    const ti = i % ticketTypes.length
    const tt = ticketTypes[ti]
    const ni = i % names.length
    const wbCode = rows[Math.floor(i / 8)][i % 8]
    const seats = seatLabels[tt] || null

    const day = String(17 + (i % 8)).padStart(2, '0')
    const hour = String(8 + (i % 10)).padStart(2, '0')
    const min = String((i * 7) % 60).padStart(2, '0')
    const wbColor = wristbandConfigs.find(w => w.ticketTypeName === tt)?.wristbandColor || 'Putih'
    const wbType = wristbandConfigs.find(w => w.ticketTypeName === tt)?.wristbandType || 'Fabric'

    redemptions.push({
      id: `red-${String(i + 1).padStart(5, '0')}`,
      ticketCode: `SHL-JKT-${tt.replace(/\s/g, '').toUpperCase().slice(0, 6)}-${String(i + 1).padStart(4, '0')}`,
      ticketType: tt,
      attendeeName: names[ni],
      attendeeEmail: emails[ni],
      wristbandCode: wbCode,
      wristbandColor: wbColor,
      wristbandType: wbType,
      seatLabel: seats ? seats[i % seats.length] : null,
      counterName: counters[i % counters.length],
      staffName: counterStaff[i % counterStaff.length],
      price: prices[ti],
      redeemedAt: `2025-05-${day}T${hour}:${min}:00`,
    })
    wbIdx++
  }

  return redemptions.reverse()
})()

// ─── GATE LOGS (Entry/Exit Tracking) ────────────────────────────────────────

export const mockGateLogs: GateLog[] = (() => {
  const logs: GateLog[] = []
  const names = ['Budi Santoso', 'Sari Dewi', 'Ahmad Hidayat', 'Fitri Handayani', 'Rudi Hartono', 'Yuliana Putri', 'Dimas Arya', 'Ani Rahayu', 'Indah Permatasari', 'Kevin Anggara', 'Tania Putri', 'Yoga Adi', 'Shela Maharani', 'Reza Arap', 'Bella Nova']
  const ticketTypes = ['VVIP PIT', 'VIP ZONE', 'FESTIVAL', 'CAT 1', 'CAT 2', 'CAT 3']
  const gateStaff = ['Bayu Aditya', 'Sinta Dewi', 'Doni Firmansyah', 'Citra Kirana', 'Eko Prasetya', 'Winda Sari', 'Oscar Pratama', 'Nadira Zahra', 'Shela Maharani']
  const gates = [
    { name: 'Gate A', type: 'entry' as const },
    { name: 'Gate B', type: 'entry' as const },
    { name: 'Gate C', type: 'entry' as const },
    { name: 'Gate D', type: 'exit' as const },
    { name: 'Gate E', type: 'both' as const },
    { name: 'VIP Gate', type: 'entry' as const },
    { name: 'Gate F', type: 'entry' as const },
  ]

  // Track re-entry counts per person
  const reentryMap: Record<string, number> = {}

  for (let i = 0; i < 120; i++) {
    const hour = 16 + Math.floor(i / 20)
    const min = (i * 3) % 60
    const sec = (i * 7) % 60
    const gate = gates[i % gates.length]
    const isExit = gate.type === 'exit' || (gate.type === 'both' && i % 5 === 0)
    const action = isExit ? 'OUT' as const : 'IN' as const

    const personIdx = i % names.length
    const personName = names[personIdx]
    reentryMap[personName] = (reentryMap[personName] || 0) + (action === 'OUT' ? 1 : 0)

    logs.push({
      id: `glog-${String(i + 1).padStart(5, '0')}`,
      ticketCode: `SHL-JKT-${ticketTypes[i % ticketTypes.length].replace(/\s/g, '').toUpperCase().slice(0, 6)}-${String(i + 100).padStart(4, '0')}`,
      userName: personName,
      ticketType: ticketTypes[i % ticketTypes.length],
      action,
      gateName: gate.name,
      gateType: gate.type,
      staffName: gateStaff[i % gateStaff.length],
      timestamp: `2025-05-24T${String(Math.min(hour, 23)).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
      reentryCount: reentryMap[personName],
    })
  }

  return logs.reverse()
})()

// ─── ATTENDEE STATUS (Real-time inside/outside tracking) ─────────────────────

export const mockAttendeeStatuses: AttendeeStatus[] = (() => {
  const names = ['Budi Santoso', 'Sari Dewi', 'Ahmad Hidayat', 'Fitri Handayani', 'Rudi Hartono', 'Yuliana Putri', 'Dimas Arya', 'Ani Rahayu', 'Indah Permatasari', 'Kevin Anggara', 'Tania Putri', 'Yoga Adi', 'Shela Maharani', 'Reza Arap', 'Bella Nova', 'Faisal Rahman', 'Gita Gutawa', 'Hendra Setiawan', 'Dewi Lestari', 'Mega Safitri']
  const ticketTypes = ['VVIP PIT', 'VIP ZONE', 'FESTIVAL', 'CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5']
  const statuses: Array<AttendeeStatus['currentStatus']> = ['not_redeemed', 'redeemed', 'inside', 'outside', 'exited']

  return names.map((name, i) => {
    const statusIdx = i < 2 ? 0 : i < 4 ? 1 : i < 12 ? 2 : i < 16 ? 3 : 4
    const tt = ticketTypes[i % ticketTypes.length]
    return {
      ticketCode: `SHL-JKT-${tt.replace(/\s/g, '').toUpperCase().slice(0, 6)}-${String(i + 100).padStart(4, '0')}`,
      userName: name,
      ticketType: tt,
      wristbandCode: statusIdx >= 1 ? `WB-${String(i + 1).padStart(5, '0')}` : null,
      seatLabel: i < 8 ? `${String.fromCharCode(65 + (i % 5))}${(i % 20) + 1}` : null,
      currentStatus: statuses[statusIdx],
      lastAction: statusIdx === 0 ? 'Pembelian dikonfirmasi' : statusIdx === 1 ? 'Gelang dipasang' : statusIdx === 2 ? 'Masuk venue' : statusIdx === 3 ? 'Keluar venue' : 'Keluar permanen',
      lastActionAt: `2025-05-24T${String(16 + (i % 3)).padStart(2, '0')}:${String((i * 5) % 60).padStart(2, '0')}:00`,
      gateUsed: statusIdx >= 2 ? ['Gate A', 'Gate B', 'VIP Gate', 'Gate C'][i % 4] : null,
      reentryCount: statusIdx === 3 ? 1 + (i % 3) : 0,
    }
  })
})()

// ─── REDEMPTION CONFIG ───────────────────────────────────────────────────────

export const mockRedemptionConfig: RedemptionConfig = {
  id: 'rc-001',
  eventId: 'event-jkt-001',
  startDate: '2025-05-17',
  endDate: '2025-05-24',
  startTime: '08:00',
  endTime: '20:00',
  status: 'active',
}

// ─── LIVE STATS ──────────────────────────────────────────────────────────────

export const liveStats = {
  totalTicketsPaid: 598,
  totalRedeemed: mockRedemptions.length,
  totalInside: mockAttendeeStatuses.filter(a => a.currentStatus === 'inside').length,
  totalOutside: mockAttendeeStatuses.filter(a => a.currentStatus === 'outside').length,
  totalExited: mockAttendeeStatuses.filter(a => a.currentStatus === 'exited').length,
  totalNotRedeemed: mockAttendeeStatuses.filter(a => a.currentStatus === 'not_redeemed').length,
  totalGateScans: mockGateLogs.length,
  totalReentries: mockGateLogs.filter(l => l.action === 'OUT').length,
  activeCounters: mockCounters.filter(c => c.status === 'active').length,
  activeGates: mockGates.filter(g => g.status === 'active').length,
  totalCounterStaff: mockStaffUsers.filter(s => s.role === 'COUNTER_STAFF' && s.status === 'active').length,
  totalGateStaff: mockStaffUsers.filter(s => s.role === 'GATE_STAFF' && s.status === 'active').length,
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'ADMIN': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'COUNTER_STAFF': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'GATE_STAFF': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'ORGANIZER': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'PARTICIPANT': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Admin'
    case 'ADMIN': return 'Admin'
    case 'COUNTER_STAFF': return 'Counter Staff'
    case 'GATE_STAFF': return 'Gate Staff'
    case 'ORGANIZER': return 'Organizer'
    case 'PARTICIPANT': return 'Peserta'
    default: return role
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-emerald-500/20 text-emerald-400'
    case 'inactive': return 'bg-gray-500/20 text-gray-400'
    case 'closed': return 'bg-red-500/20 text-red-400'
    case 'suspended': return 'bg-amber-500/20 text-amber-400'
    case 'banned': return 'bg-red-500/20 text-red-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function getAttendeeStatusBadge(status: AttendeeStatus['currentStatus']): { label: string; color: string } {
  switch (status) {
    case 'not_redeemed': return { label: 'Belum Tukar', color: 'bg-gray-500/20 text-gray-400' }
    case 'redeemed': return { label: 'Sudah Tukar', color: 'bg-amber-500/20 text-amber-400' }
    case 'inside': return { label: 'Di Dalam', color: 'bg-emerald-500/20 text-emerald-400' }
    case 'outside': return { label: 'Di Luar', color: 'bg-blue-500/20 text-blue-400' }
    case 'exited': return { label: 'Sudah Pulang', color: 'bg-red-500/20 text-red-400' }
    default: return { label: status, color: 'bg-muted text-muted-foreground' }
  }
}

export function getCounterStatusBadge(status: Counter['status']): { label: string; color: string } {
  switch (status) {
    case 'active': return { label: 'Aktif', color: 'bg-emerald-500/20 text-emerald-400' }
    case 'inactive': return { label: 'Nonaktif', color: 'bg-gray-500/20 text-gray-400' }
    case 'closed': return { label: 'Tutup', color: 'bg-red-500/20 text-red-400' }
    default: return { label: status, color: 'bg-muted text-muted-foreground' }
  }
}

export function getGateTypeBadge(type: Gate['type']): { label: string; color: string } {
  switch (type) {
    case 'entry': return { label: 'Masuk', color: 'bg-emerald-500/20 text-emerald-400' }
    case 'exit': return { label: 'Keluar', color: 'bg-red-500/20 text-red-400' }
    case 'both': return { label: 'Masuk/Keluar', color: 'bg-amber-500/20 text-amber-400' }
    default: return { label: type, color: 'bg-muted text-muted-foreground' }
  }
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDateTimeShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
