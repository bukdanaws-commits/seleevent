// ─── ADMIN DASHBOARD MOCK DATA ─────────────────────────────────────────────
// Sheila On 7 "Melompat Lebih Tinggi" Tour — Super Admin Dashboard

import { formatRupiah } from './mock-data';

// ─── ADMIN USERS ────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'SUPER_ADMIN' | 'ORGANIZER' | 'PARTICIPANT';
  status: 'active' | 'suspended' | 'banned';
  lastLogin: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export const mockAdminUsers: AdminUser[] = [
  { id: 'u-001', name: 'Bukdan Admin', email: 'bukdan@sheilaon7.id', phone: '081200001111', avatar: '', role: 'SUPER_ADMIN', status: 'active', lastLogin: '2025-05-24T08:00:00', createdAt: '2025-01-01', totalOrders: 0, totalSpent: 0 },
  { id: 'u-002', name: 'Rizky Pratama', email: 'rizky@sheilaon7.id', phone: '081200002222', avatar: '', role: 'SUPER_ADMIN', status: 'active', lastLogin: '2025-05-24T07:30:00', createdAt: '2025-01-15', totalOrders: 0, totalSpent: 0 },
  { id: 'u-003', name: 'Andi Wijaya', email: 'andi.wijaya@gmail.com', phone: '081200003333', avatar: '', role: 'ORGANIZER', status: 'active', lastLogin: '2025-05-24T06:00:00', createdAt: '2025-02-01', totalOrders: 0, totalSpent: 0 },
  { id: 'u-004', name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', phone: '081200004444', avatar: '', role: 'ORGANIZER', status: 'active', lastLogin: '2025-05-23T18:00:00', createdAt: '2025-02-10', totalOrders: 0, totalSpent: 0 },
  { id: 'u-005', name: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', phone: '081200005555', avatar: '', role: 'ORGANIZER', status: 'active', lastLogin: '2025-05-24T10:00:00', createdAt: '2025-02-15', totalOrders: 0, totalSpent: 0 },
  ...generateParticipantUsers(),
];

function generateParticipantUsers(): AdminUser[] {
  const names = [
    'Budi Santoso', 'Sari Dewi', 'Ahmad Hidayat', 'Fitri Handayani', 'Rudi Hartono',
    'Yuliana Putri', 'Dimas Arya', 'Rina Wulandari', 'Fajar Nugroho', 'Mega Safitri',
    'Hendra Setiawan', 'Ani Rahayu', 'Teguh Prasetyo', 'Nia Kurnia', 'Bayu Aditya',
    'Diana Permata', 'Agus Riyanto', 'Lina Marlina', 'Wahyu Hidayat', 'Ratna Sari',
    'Irfan Hakim', 'Dina Fitria', 'Joko Widodo', 'Maya Angelina', 'Bambang Supriyo',
    'Putri Ayu', 'Ricky Harun', 'Sinta Dewi', 'Doni Firmansyah', 'Citra Kirana',
    'Eko Prasetya', 'Winda Sari', 'Galang Ramadhan', 'Nadira Zahra', 'Oscar Pratama',
    'Indah Permatasari', 'Kevin Anggara', 'Tania Putri', 'Yoga Adi', 'Shela Maharani',
    'Reza Arap', 'Ayu Tingting', 'Surya Darma', 'Bella Nova', 'Faisal Rahman',
    'Gita Gutawa',
  ];
  return names.map((name, i) => ({
    id: `u-${String(i + 6).padStart(3, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@gmail.com`,
    phone: `0812${String(10000000 + i * 123456).padStart(8, '0')}`,
    avatar: '',
    role: 'PARTICIPANT' as const,
    status: i === 42 ? 'suspended' as const : 'active' as const,
    lastLogin: `2025-05-${String(20 + (i % 5)).padStart(2, '0')}T${String(8 + (i % 12)).padStart(2, '0')}:${String(i * 7 % 60).padStart(2, '0')}:00`,
    createdAt: `2025-03-${String(1 + (i % 28)).padStart(2, '0')}`,
    totalOrders: 1 + (i % 3),
    totalSpent: (1 + (i % 3)) * [3500000, 2800000, 2200000, 1750000, 1400000, 1100000, 850000, 550000][i % 8],
  }));
}

// ─── ADMIN ORDERS ───────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'rejected' | 'cancelled' | 'expired';

export interface AdminOrder {
  id: string;
  orderCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  ticketType: string;
  quantity: number;
  pricePerTicket: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  proofUploaded: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
}

export const mockAdminOrders: AdminOrder[] = generateOrders();

function generateOrders(): AdminOrder[] {
  const ticketTypes = [
    { name: 'VVIP PIT', price: 3500000, id: 'tt-vvip' },
    { name: 'VIP ZONE', price: 2800000, id: 'tt-vip' },
    { name: 'FESTIVAL', price: 2200000, id: 'tt-festival' },
    { name: 'CAT 1', price: 1750000, id: 'tt-cat1' },
    { name: 'CAT 2', price: 1400000, id: 'tt-cat2' },
    { name: 'CAT 3', price: 1100000, id: 'tt-cat3' },
    { name: 'CAT 4', price: 850000, id: 'tt-cat4' },
    { name: 'CAT 5', price: 550000, id: 'tt-cat5' },
  ];
  const statuses: OrderStatus[] = ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'pending', 'rejected', 'cancelled', 'expired'];
  const methods = ['QRIS - BSI', 'QRIS - GoPay', 'QRIS - OVO', 'QRIS - Dana', 'Transfer BSI', 'Transfer Mandiri'];
  const users = mockAdminUsers.filter(u => u.role === 'PARTICIPANT');

  return Array.from({ length: 100 }, (_, i) => {
    const tt = ticketTypes[i % ticketTypes.length];
    const user = users[i % users.length];
    const status = statuses[i % statuses.length];
    const qty = 1 + (i % 5);
    const total = tt.price * qty;
    const dateStr = `2025-05-${String(18 + (i % 7)).padStart(2, '0')}`;
    const hour = String(8 + (i % 14)).padStart(2, '0');
    const min = String((i * 13) % 60).padStart(2, '0');
    const createdAt = `${dateStr}T${hour}:${min}:00`;

    return {
      id: `ord-${String(i + 1).padStart(4, '0')}`,
      orderCode: `SHL-JKT-${String(20250524)}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 3) % 26))}${String.fromCharCode(48 + (i % 10))}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      eventId: 'event-jkt-001',
      eventTitle: 'Sheila On 7 — JAKARTA',
      eventDate: '24 Mei 2025',
      ticketType: tt.name,
      quantity: qty,
      pricePerTicket: tt.price,
      totalAmount: total,
      status,
      paymentMethod: methods[i % methods.length],
      proofUploaded: status !== 'cancelled' && status !== 'expired',
      verifiedBy: status === 'paid' ? 'Rizky Pratama' : status === 'rejected' ? 'Bukdan Admin' : null,
      verifiedAt: status === 'paid' || status === 'rejected' ? createdAt : null,
      rejectionReason: status === 'rejected' ? ['Nominal tidak sesuai', 'Bukti tidak terbaca', 'Transfer dari rekening berbeda', 'Batas waktu habis'][i % 4] : null,
      createdAt,
      expiresAt: `${dateStr}T${String(22 + (i % 2)).padStart(2, '0')}:00`,
      paidAt: status === 'paid' ? `${dateStr}T${String(parseInt(hour) + 1).padStart(2, '0')}:${min}:00` : null,
    };
  });
}

// ─── VERIFICATIONS ──────────────────────────────────────────────────────────

export interface VerificationItem {
  id: string;
  orderId: string;
  orderCode: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  proofUrl: string;
  status: 'queued' | 'in_review' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  slaMinutesLeft: number;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export const mockVerifications: VerificationItem[] = (() => {
  const pending = mockAdminOrders.filter(o => o.status === 'pending' && o.proofUploaded).map((o, i) => ({
    id: `ver-p-${i + 1}`,
    orderId: o.id,
    orderCode: o.orderCode,
    userName: o.userName,
    userEmail: o.userEmail,
    ticketType: o.ticketType,
    quantity: o.quantity,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    proofUrl: `/images/mock-proof-${o.id}.jpg`,
    status: 'queued' as const,
    createdAt: o.createdAt,
    slaMinutesLeft: 25 - (i * 3),
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  }));

  const approved = mockAdminOrders.filter(o => o.status === 'paid').slice(0, 30).map((o, i) => ({
    id: `ver-a-${i + 1}`,
    orderId: o.id,
    orderCode: o.orderCode,
    userName: o.userName,
    userEmail: o.userEmail,
    ticketType: o.ticketType,
    quantity: o.quantity,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    proofUrl: `/images/mock-proof-${o.id}.jpg`,
    status: 'approved' as const,
    createdAt: o.createdAt,
    slaMinutesLeft: 0,
    reviewedBy: o.verifiedBy,
    reviewedAt: o.paidAt,
    rejectionReason: null,
  }));

  const rejected = mockAdminOrders.filter(o => o.status === 'rejected').map((o, i) => ({
    id: `ver-r-${i + 1}`,
    orderId: o.id,
    orderCode: o.orderCode,
    userName: o.userName,
    userEmail: o.userEmail,
    ticketType: o.ticketType,
    quantity: o.quantity,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    proofUrl: `/images/mock-proof-${o.id}.jpg`,
    status: 'rejected' as const,
    createdAt: o.createdAt,
    slaMinutesLeft: 0,
    reviewedBy: o.verifiedBy,
    reviewedAt: o.verifiedAt,
    rejectionReason: o.rejectionReason,
  }));

  return [...pending, ...approved, ...rejected];
})();

// ─── TICKETS & WRISTBANDS ──────────────────────────────────────────────────

export interface TicketRecord {
  id: string;
  ticketCode: string;
  orderCode: string;
  userName: string;
  ticketType: string;
  tier: 'floor' | 'tribun';
  status: 'active' | 'redeemed' | 'inside' | 'cancelled';
  wristbandCode: string | null;
  wristbandLinked: boolean;
  redeemedAt: string | null;
  redeemedBy: string | null;
  createdAt: string;
}

export const mockTickets: TicketRecord[] = (() => {
  const paidOrders = mockAdminOrders.filter(o => o.status === 'paid');
  const tickets: TicketRecord[] = [];

  paidOrders.forEach(order => {
    for (let j = 0; j < order.quantity; j++) {
      const isRedeemed = Math.random() > 0.6;
      const isInside = isRedeemed && Math.random() > 0.5;
      const tier = ['VVIP PIT', 'VIP ZONE', 'FESTIVAL'].includes(order.ticketType) ? 'floor' as const : 'tribun' as const;
      tickets.push({
        id: `tkt-${String(tickets.length + 1).padStart(5, '0')}`,
        ticketCode: `SHL-JKT-${order.ticketType.replace(/\s/g, '').toUpperCase().slice(0, 6)}-${String(tickets.length + 1).padStart(4, '0')}`,
        orderCode: order.orderCode,
        userName: order.userName,
        ticketType: order.ticketType,
        tier,
        status: isInside ? 'inside' : isRedeemed ? 'redeemed' : 'active',
        wristbandCode: isRedeemed || isInside ? `WB-${String(tickets.length + 1).padStart(5, '0')}` : null,
        wristbandLinked: isRedeemed || isInside,
        redeemedAt: isRedeemed || isInside ? '2025-05-24T16:30:00' : null,
        redeemedBy: isRedeemed || isInside ? 'Andi Wijaya' : null,
        createdAt: order.createdAt,
      });
    }
  });

  return tickets;
})();

export const wristbandStats = {
  total: 5000,
  assigned: mockTickets.filter(t => t.wristbandLinked).length,
  unused: 5000 - mockTickets.filter(t => t.wristbandLinked).length,
  scanned: mockTickets.filter(t => t.status === 'inside').length,
};

// ─── CREW & GATES ──────────────────────────────────────────────────────────

export interface CrewMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ORGANIZER' | 'VERIFICATION_ADMIN' | 'REDEEM_CREW' | 'SCANNER_CREW';
  eventId: string;
  assignedGate: string | null;
  assignedStation: string | null;
  status: 'active' | 'inactive';
  lastActive: string;
}

export const mockCrew: CrewMember[] = [
  { id: 'cr-001', name: 'Andi Wijaya', email: 'andi.wijaya@gmail.com', phone: '081200003333', role: 'ORGANIZER', eventId: 'event-jkt-001', assignedGate: null, assignedStation: 'A1', status: 'active', lastActive: '2025-05-24T16:30:00' },
  { id: 'cr-002', name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', phone: '081200004444', role: 'ORGANIZER', eventId: 'event-jkt-001', assignedGate: null, assignedStation: 'A2', status: 'active', lastActive: '2025-05-24T16:25:00' },
  { id: 'cr-003', name: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', phone: '081200005555', role: 'ORGANIZER', eventId: 'event-jkt-001', assignedGate: null, assignedStation: 'B1', status: 'active', lastActive: '2025-05-24T16:20:00' },
  { id: 'cr-004', name: 'Fajar Nugroho', email: 'fajar.n@gmail.com', phone: '081200006666', role: 'SCANNER_CREW', eventId: 'event-jkt-001', assignedGate: 'Gate A', assignedStation: null, status: 'active', lastActive: '2025-05-24T17:00:00' },
  { id: 'cr-005', name: 'Mega Safitri', email: 'mega.s@gmail.com', phone: '081200007777', role: 'SCANNER_CREW', eventId: 'event-jkt-001', assignedGate: 'Gate B', assignedStation: null, status: 'active', lastActive: '2025-05-24T17:05:00' },
  { id: 'cr-006', name: 'Hendra Setiawan', email: 'hendra.s@gmail.com', phone: '081200008888', role: 'SCANNER_CREW', eventId: 'event-jkt-001', assignedGate: 'Gate C', assignedStation: null, status: 'active', lastActive: '2025-05-24T17:10:00' },
  { id: 'cr-007', name: 'Teguh Prasetyo', email: 'teguh.p@gmail.com', phone: '081200009999', role: 'SCANNER_CREW', eventId: 'event-jkt-001', assignedGate: 'VIP Gate', assignedStation: null, status: 'active', lastActive: '2025-05-24T16:55:00' },
  { id: 'cr-008', name: 'Rina Wulandari', email: 'rina.w@gmail.com', phone: '081200009999', role: 'SCANNER_CREW', eventId: 'event-jkt-001', assignedGate: 'Gate D', assignedStation: null, status: 'inactive', lastActive: '2025-05-23T18:00:00' },
];

export interface GateConfig {
  id: string;
  name: string;
  type: 'entry' | 'exit' | 'both';
  location: string;
  minAccessLevel: string;
  capacityPerMinute: number;
  isActive: boolean;
  currentScanner: string | null;
}

export const mockGates: GateConfig[] = [
  { id: 'gate-a', name: 'Gate A', type: 'entry', location: 'Utara - Kiri', minAccessLevel: 'FESTIVAL', capacityPerMinute: 30, isActive: true, currentScanner: 'Fajar Nugroho' },
  { id: 'gate-b', name: 'Gate B', type: 'entry', location: 'Utara - Kanan', minAccessLevel: 'FESTIVAL', capacityPerMinute: 30, isActive: true, currentScanner: 'Mega Safitri' },
  { id: 'gate-c', name: 'Gate C', type: 'entry', location: 'Timur', minAccessLevel: 'CAT 3', capacityPerMinute: 25, isActive: true, currentScanner: 'Hendra Setiawan' },
  { id: 'gate-d', name: 'Gate D', type: 'exit', location: 'Selatan - Kiri', minAccessLevel: 'FESTIVAL', capacityPerMinute: 20, isActive: false, currentScanner: null },
  { id: 'vip-gate', name: 'VIP Gate', type: 'entry', location: 'Barat - VIP Area', minAccessLevel: 'VIP', capacityPerMinute: 15, isActive: true, currentScanner: 'Teguh Prasetyo' },
  { id: 'exit-main', name: 'Exit Main', type: 'exit', location: 'Selatan - Tengah', minAccessLevel: 'FESTIVAL', capacityPerMinute: 40, isActive: false, currentScanner: null },
];

// ─── GATE MONITORING ───────────────────────────────────────────────────────

export interface GateStats {
  gateId: string;
  gateName: string;
  totalIn: number;
  totalOut: number;
  currentInside: number;
  ratePerMinute: number;
  capacity: number;
  lastScan: string;
}

export const mockGateStats: GateStats[] = [
  { gateId: 'gate-a', gateName: 'Gate A', totalIn: 2340, totalOut: 120, currentInside: 2220, ratePerMinute: 18, capacity: 5000, lastScan: '2025-05-24T18:05:00' },
  { gateId: 'gate-b', gateName: 'Gate B', totalIn: 2180, totalOut: 95, currentInside: 2085, ratePerMinute: 22, capacity: 5000, lastScan: '2025-05-24T18:04:00' },
  { gateId: 'gate-c', gateName: 'Gate C', totalIn: 1560, totalOut: 45, currentInside: 1515, ratePerMinute: 12, capacity: 4000, lastScan: '2025-05-24T18:06:00' },
  { gateId: 'vip-gate', gateName: 'VIP Gate', totalIn: 480, totalOut: 10, currentInside: 470, ratePerMinute: 8, capacity: 800, lastScan: '2025-05-24T18:05:00' },
];

export interface CheckinLog {
  id: string;
  ticketCode: string;
  userName: string;
  ticketType: string;
  action: 'IN' | 'OUT';
  gateName: string;
  scannedBy: string;
  timestamp: string;
}

export const mockCheckinLogs: CheckinLog[] = (() => {
  const logs: CheckinLog[] = [];
  const scanners = ['Fajar Nugroho', 'Mega Safitri', 'Hendra Setiawan', 'Teguh Prasetyo'];
  const gates = ['Gate A', 'Gate B', 'Gate C', 'VIP Gate'];
  const names = mockAdminUsers.filter(u => u.role === 'PARTICIPANT').map(u => u.name);
  const types = ['VVIP PIT', 'VIP ZONE', 'FESTIVAL', 'CAT 1', 'CAT 2', 'CAT 3'];

  for (let i = 0; i < 50; i++) {
    const hour = 16 + Math.floor(i / 10);
    const min = (i * 3) % 60;
    logs.push({
      id: `log-${String(i + 1).padStart(4, '0')}`,
      ticketCode: `SHL-JKT-${types[i % types.length].replace(/\s/g, '').toUpperCase().slice(0, 6)}-${String(i + 100).padStart(4, '0')}`,
      userName: names[i % names.length],
      ticketType: types[i % types.length],
      action: i % 15 === 0 ? 'OUT' : 'IN',
      gateName: gates[i % gates.length],
      scannedBy: scanners[i % scanners.length],
      timestamp: `2025-05-24T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    });
  }

  return logs.reverse();
})();

// ─── ANALYTICS ─────────────────────────────────────────────────────────────

export const ticketTypeLabels = ['VVIP PIT', 'VIP ZONE', 'FESTIVAL', 'CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5'];
export const ticketTypePrices = [3500000, 2800000, 2200000, 1750000, 1400000, 1100000, 850000, 550000];
export const ticketTypeQuota = [300, 500, 3000, 2000, 3000, 3000, 4000, 3000];
export const ticketTypeSold = [247, 412, 2847, 1780, 2410, 1950, 2680, 1520];

export const salesByTier = ticketTypeLabels.map((name, i) => ({
  name,
  terjual: ticketTypeSold[i],
  quota: ticketTypeQuota[i],
  revenue: ticketTypeSold[i] * ticketTypePrices[i],
  percentage: Math.round((ticketTypeSold[i] / ticketTypeQuota[i]) * 100),
}));

export const revenueChartData = [
  { date: '18 Mei', revenue: 285000000, orders: 42 },
  { date: '19 Mei', revenue: 456000000, orders: 68 },
  { date: '20 Mei', revenue: 623000000, orders: 95 },
  { date: '21 Mei', revenue: 389000000, orders: 58 },
  { date: '22 Mei', revenue: 712000000, orders: 112 },
  { date: '23 Mei', revenue: 987000000, orders: 156 },
  { date: '24 Mei', revenue: 432000000, orders: 67 },
];

export const hourlySalesData = [
  { hour: '08:00', sales: 5 },
  { hour: '09:00', sales: 12 },
  { hour: '10:00', sales: 28 },
  { hour: '11:00', sales: 35 },
  { hour: '12:00', sales: 18 },
  { hour: '13:00', sales: 22 },
  { hour: '14:00', sales: 38 },
  { hour: '15:00', sales: 45 },
  { hour: '16:00', sales: 52 },
  { hour: '17:00', sales: 30 },
  { hour: '18:00', sales: 25 },
  { hour: '19:00', sales: 15 },
];

export const paymentMethodBreakdown = [
  { method: 'QRIS - GoPay', count: 45, percentage: 38 },
  { method: 'QRIS - OVO', count: 22, percentage: 19 },
  { method: 'QRIS - Dana', count: 18, percentage: 15 },
  { method: 'QRIS - ShopeePay', count: 12, percentage: 10 },
  { method: 'QRIS - BSI', count: 8, percentage: 7 },
  { method: 'Transfer BSI', count: 8, percentage: 7 },
  { method: 'Transfer Mandiri', count: 5, percentage: 4 },
];

// ─── AUDIT LOGS ────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ip: string;
  timestamp: string;
}

export const mockAuditLogs: AuditLog[] = [
  { id: 'al-001', userId: 'u-002', userName: 'Rizky Pratama', action: 'APPROVE', module: 'Verifikasi', details: 'Approved payment for order SHL-JKT-20250524-A1B2C', ip: '103.45.67.89', timestamp: '2025-05-24T18:05:00' },
  { id: 'al-002', userId: 'u-001', userName: 'Bukdan Admin', action: 'UPDATE', module: 'Event', details: 'Updated ticket quota for VVIP PIT: 280→300', ip: '103.45.67.88', timestamp: '2025-05-24T17:30:00' },
  { id: 'al-003', userId: 'u-002', userName: 'Rizky Pratama', action: 'REJECT', module: 'Verifikasi', details: 'Rejected payment for order SHL-JKT-20250524-X9Y8Z - Nominal tidak sesuai', ip: '103.45.67.89', timestamp: '2025-05-24T17:15:00' },
  { id: 'al-004', userId: 'u-001', userName: 'Bukdan Admin', action: 'ASSIGN', module: 'Crew', details: 'Assigned Fajar Nugroho as Scanner Crew at Gate A', ip: '103.45.67.88', timestamp: '2025-05-24T16:00:00' },
  { id: 'al-005', userId: 'u-001', userName: 'Bukdan Admin', action: 'LOGIN', module: 'Auth', details: 'Super Admin login via Google OAuth', ip: '103.45.67.88', timestamp: '2025-05-24T08:00:00' },
  { id: 'al-006', userId: 'u-003', userName: 'Andi Wijaya', action: 'REDEEM', module: 'Gelang', details: 'Paired wristband WB-00001 for ticket SHL-JKT-VVIPPI-0001', ip: '192.168.1.50', timestamp: '2025-05-24T16:30:00' },
  { id: 'al-007', userId: 'u-002', userName: 'Rizky Pratama', action: 'APPROVE', module: 'Verifikasi', details: 'Approved payment for order SHL-JKT-20250524-D4E5F', ip: '103.45.67.89', timestamp: '2025-05-24T15:45:00' },
  { id: 'al-008', userId: 'u-004', userName: 'Siti Nurhaliza', action: 'REDEEM', module: 'Gelang', details: 'Paired wristband WB-00015 for ticket SHL-JKT-FESTIV-0015', ip: '192.168.1.51', timestamp: '2025-05-24T16:35:00' },
  { id: 'al-009', userId: 'u-001', userName: 'Bukdan Admin', action: 'CREATE', module: 'Event', details: 'Created event Sheila On 7 - JAKARTA', ip: '103.45.67.88', timestamp: '2025-05-01T10:00:00' },
  { id: 'al-010', userId: 'u-005', userName: 'Dewi Lestari', action: 'REDEEM', module: 'Gelang', details: 'Paired wristband WB-00030 for ticket SHL-JKT-CAT1-0030', ip: '192.168.1.52', timestamp: '2025-05-24T16:40:00' },
  { id: 'al-011', userId: 'u-001', userName: 'Bukdan Admin', action: 'UPDATE', module: 'Settings', details: 'Updated payment timeout from 1h to 2h', ip: '103.45.67.88', timestamp: '2025-05-20T14:00:00' },
  { id: 'al-012', userId: 'u-002', userName: 'Rizky Pratama', action: 'APPROVE', module: 'Verifikasi', details: 'Approved payment for order SHL-JKT-20250524-M3N4O', ip: '103.45.67.89', timestamp: '2025-05-24T14:20:00' },
];

// ─── DASHBOARD KPIs ────────────────────────────────────────────────────────

export const dashboardKPIs = {
  totalRevenue: salesByTier.reduce((sum, s) => sum + s.revenue, 0),
  totalTicketsSold: ticketTypeSold.reduce((sum, s) => sum + s, 0),
  totalOrders: mockAdminOrders.length,
  paidOrders: mockAdminOrders.filter(o => o.status === 'paid').length,
  pendingOrders: mockAdminOrders.filter(o => o.status === 'pending').length,
  totalUsers: mockAdminUsers.length,
  totalQuota: ticketTypeQuota.reduce((sum, q) => sum + q, 0),
  ticketsRedeemed: mockTickets.filter(t => t.status === 'redeemed' || t.status === 'inside').length,
  ticketsInside: mockTickets.filter(t => t.status === 'inside').length,
  pendingVerifications: mockVerifications.filter(v => v.status === 'queued' || v.status === 'in_review').length,
  avgVerificationTime: 12,
  occupancyRate: 68.5,
};

// ─── SYSTEM HEALTH ─────────────────────────────────────────────────────────

export const systemHealth = {
  serverStatus: 'healthy' as const,
  cpuUsage: 34,
  memoryUsage: 62,
  diskUsage: 45,
  dbStatus: 'connected' as const,
  queueDepth: 3,
  avgResponseTime: 142,
  errorRate: 0.3,
  uptime: '99.97%',
};
