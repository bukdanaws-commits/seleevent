// ─── SELEEVENT TYPE SYSTEM ──────────────────────────────────────────────────
// TypeScript types matching Golang GORM models
// Backend: Golang Fiber + GORM (PostgreSQL)
// Frontend: Next.js 16 + React 19

// ─── ENUMS ─────────────────────────────────────────────────────────────────

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'ORGANIZER' 
  | 'COUNTER_STAFF' 
  | 'GATE_STAFF' 
  | 'PARTICIPANT'

export type UserStatus = 'active' | 'suspended' | 'banned'

export type EventStatus = 'draft' | 'published' | 'sold_out' | 'completed'

export type OrderStatus = 'pending' | 'paid' | 'rejected' | 'cancelled' | 'expired'

export type TicketStatus = 'active' | 'redeemed' | 'inside' | 'outside' | 'cancelled'

export type TicketTier = 'floor' | 'tribun'

export type CounterStatus = 'inactive' | 'active' | 'closed'

export type GateType = 'entry' | 'exit' | 'both'

export type GateAction = 'IN' | 'OUT'

export type AttendeeStatus = 'not_redeemed' | 'redeemed' | 'inside' | 'outside' | 'exited'

export type ShiftType = 'pagi' | 'siang' | 'malam' | 'full'

export type RedemptionConfigStatus = 'upcoming' | 'active' | 'ended'

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export type NotificationCategory = 'order' | 'redemption' | 'gate' | 'system' | 'payment'

export type TenantPlan = 'free' | 'pro' | 'enterprise'

export type PaymentMethod = 
  | 'QRIS - BSI' 
  | 'QRIS - GoPay' 
  | 'QRIS - OVO' 
  | 'QRIS - Dana' 
  | 'QRIS - ShopeePay' 
  | 'QRIS - LinkAja'
  | 'Transfer BSI' 
  | 'Transfer Mandiri'

// ─── CORE MODELS (matching Golang GORM) ────────────────────────────────────

export interface IUser {
  id: string
  googleId: string
  email: string
  name: string
  avatar?: string
  phone?: string
  role: UserRole
  status: UserStatus
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface IEvent {
  id: string
  tenantId?: string
  slug: string
  title: string
  subtitle?: string
  date: string
  doorsOpen?: string
  venue: string
  city: string
  address?: string
  capacity: number
  status: EventStatus
  createdAt: string
  updatedAt: string
}

export interface ITicketType {
  id: string
  eventId: string
  name: string
  description?: string
  price: number
  quota: number
  sold: number
  tier: TicketTier
  zone?: string
  emoji?: string
  benefits?: string[]
  seatConfig?: string
}

export interface IOrder {
  id: string
  orderCode: string
  userId: string
  eventId: string
  totalAmount: number
  status: OrderStatus
  paymentMethod?: string
  expiresAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface IOrderItem {
  id: string
  orderId: string
  ticketTypeId: string
  quantity: number
  pricePerTicket: number
  subtotal: number
}

export interface ITicket {
  id: string
  ticketCode: string
  orderId: string
  ticketTypeId: string
  attendeeName: string
  attendeeEmail: string
  seatLabel?: string
  qrData: string
  status: TicketStatus
  redeemedAt?: string
  redeemedBy?: string
  wristbandCode?: string
  createdAt: string
  updatedAt: string
}

export interface ICounter {
  id: string
  eventId: string
  name: string
  location?: string
  capacity: number
  status: CounterStatus
  openAt?: string
  closeAt?: string
  createdAt: string
  updatedAt: string
}

export interface ICounterStaff {
  id: string
  userId: string
  counterId: string
  shift?: ShiftType
  status: string
  assignedAt: string
}

export interface IGate {
  id: string
  eventId: string
  name: string
  type: GateType
  location?: string
  minAccessLevel?: string
  capacityPerMin: number
  status: CounterStatus
  createdAt: string
  updatedAt: string
}

export interface IGateStaff {
  id: string
  userId: string
  gateId: string
  shift?: ShiftType
  status: string
  assignedAt: string
}

export interface IRedemption {
  id: string
  ticketId: string
  counterId: string
  staffId: string
  wristbandCode: string
  wristbandColor: string
  wristbandType: string
  notes?: string
  redeemedAt: string
}

export interface IGateLog {
  id: string
  ticketId: string
  gateId: string
  staffId: string
  action: GateAction
  notes?: string
  scannedAt: string
}

export interface IAuditLog {
  id: string
  userId: string
  action: string
  module: string
  details?: string
  ip?: string
  createdAt: string
}

// ─── NEW MODELS (Phase 2 additions) ────────────────────────────────────────

export interface IWristbandInventory {
  id: string
  eventId: string
  color: string
  colorHex: string
  type: string
  totalStock: number
  usedStock: number
  remainingStock: number
  createdAt: string
  updatedAt: string
}

export interface INotification {
  id: string
  userId?: string
  eventId?: string
  title: string
  message: string
  type: NotificationType
  category?: NotificationCategory
  isRead: boolean
  data?: string
  createdAt: string
}

export interface ITenant {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  plan: TenantPlan
  isActive: boolean
  maxEvents: number
  maxTickets: number
  createdAt: string
  updatedAt: string
}

export interface ITenantUser {
  id: string
  userId: string
  tenantId: string
  role: UserRole
  isActive: boolean
  joinedAt: string
}

// ─── API REQUEST / RESPONSE DTOs ──────────────────────────────────────────

// Auth
export interface IAuthGoogleRequest {
  token: string
}

export interface IAuthResponse {
  user: IUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface IRefreshTokenRequest {
  refreshToken: string
}

// Ticket
export interface ICheckTicketRequest {
  ticketCode: string
}

export interface ICheckTicketResponse {
  found: boolean
  ticket?: {
    ticketCode: string
    ticketTypeName: string
    attendeeName: string
    attendeeEmail: string
    seatLabel?: string
    status: TicketStatus
    redeemedAt?: string
    wristbandCode?: string
    wristbandColor?: string
    price: number
    eventName: string
    eventDate: string
  }
  error?: string
}

// Redemption
export interface IRedeemTicketRequest {
  ticketCode: string
  counterId: string
  wristbandCode: string
  notes?: string
}

export interface IRedeemTicketResponse {
  success: boolean
  redemption?: IRedemption
  wristbandColor: string
  wristbandType: string
  ticketTypeName: string
  attendeeName: string
  error?: string
}

// Gate Scan
export interface IGateScanRequest {
  ticketCode: string
  gateId: string
  action: GateAction
  notes?: string
}

export interface IGateScanResponse {
  success: boolean
  action: GateAction
  ticketCode: string
  attendeeName: string
  ticketTypeName: string
  wristbandColor?: string
  reentryCount: number
  previousAction?: GateAction
  error?: string
}

// Live Stats
export interface ILiveStats {
  totalTicketsPaid: number
  totalRedeemed: number
  totalInside: number
  totalOutside: number
  totalExited: number
  totalNotRedeemed: number
  totalGateScans: number
  totalReentries: number
  activeCounters: number
  activeGates: number
  totalCounterStaff: number
  totalGateStaff: number
  occupancyRate: number
  totalRevenue: number
}

// WebSocket Messages
export interface IWSMessage {
  type: 'redemption' | 'gate_scan' | 'stats_update' | 'notification' | 'counter_status' | 'gate_status'
  data: unknown
  timestamp: string
}

export interface IWSRedemptionData {
  redemptionId: string
  ticketCode: string
  attendeeName: string
  ticketTypeName: string
  wristbandCode: string
  wristbandColor: string
  counterName: string
  staffName: string
}

export interface IWSGateScanData {
  gateLogId: string
  ticketCode: string
  attendeeName: string
  ticketTypeName: string
  action: GateAction
  gateName: string
  staffName: string
  reentryCount: number
}

// Dashboard Stats (from Golang backend)
export interface IDashboardKPIs {
  totalRevenue: number
  totalTicketsSold: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  totalUsers: number
  totalQuota: number
  ticketsRedeemed: number
  ticketsInside: number
  pendingVerifications: number
  avgVerificationTime: number
  occupancyRate: number
}

// ─── ROLE ACCESS MATRIX ────────────────────────────────────────────────────

export const ROLE_ACCESS: Record<UserRole, {
  dashboard: string
  routes: string[]
  canViewAll: boolean
}> = {
  SUPER_ADMIN: {
    dashboard: '/admin',
    routes: ['/admin/*'],
    canViewAll: true,
  },
  ADMIN: {
    dashboard: '/admin',
    routes: ['/admin/*'],
    canViewAll: true,
  },
  ORGANIZER: {
    dashboard: '/organizer',
    routes: ['/organizer/*'],
    canViewAll: false,
  },
  COUNTER_STAFF: {
    dashboard: '/counter',
    routes: ['/counter/*'],
    canViewAll: false,
  },
  GATE_STAFF: {
    dashboard: '/gate',
    routes: ['/gate/*'],
    canViewAll: false,
  },
  PARTICIPANT: {
    dashboard: '/',
    routes: ['/'],
    canViewAll: false,
  },
}
