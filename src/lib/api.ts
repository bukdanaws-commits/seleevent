// ─── SELEEVENT API CLIENT ──────────────────────────────────────────────────
// Centralized API endpoint constants + fetch client
// Backend: Golang Fiber v2 (Port 8080)
// All requests go through Next.js API routes as proxy (for production)
// Dev mode: Direct to Golang backend via XTransformPort

import type {
  ICheckTicketRequest,
  ICheckTicketResponse,
  IRedeemTicketRequest,
  IRedeemTicketResponse,
  IGateScanRequest,
  IGateScanResponse,
  ILiveStats,
  IDashboardKPIs,
} from './types'

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Golang backend port (for XTransformPort gateway)
const GO_BACKEND_PORT = process.env.NEXT_PUBLIC_GO_PORT || '8080'

// Whether to use direct Golang backend or Next.js API proxy
const USE_DIRECT_BACKEND = process.env.NEXT_PUBLIC_USE_DIRECT_BACKEND === 'true'

function getBaseUrl(): string {
  if (USE_DIRECT_BACKEND) {
    return `/?XTransformPort=${GO_BACKEND_PORT}`
  }
  return API_BASE
}

// ─── API ENDPOINTS (matching Golang Fiber routes) ──────────────────────────

export const API = {
  // Auth
  AUTH: {
    GOOGLE_LOGIN:   '/api/v1/auth/google',
    REFRESH_TOKEN:  '/api/v1/auth/refresh',
    LOGOUT:         '/api/v1/auth/logout',
    ME:             '/api/v1/auth/me',
  },

  // Public
  PUBLIC: {
    CHECK_TICKET:   '/api/v1/tickets/check',
    EVENT_DETAIL:   (slug: string) => `/api/v1/events/${slug}`,
    TICKET_TYPES:   (eventId: string) => `/api/v1/events/${eventId}/ticket-types`,
  },

  // Organizer (SUPER_ADMIN | ADMIN | ORGANIZER)
  ORGANIZER: {
    DASHBOARD_STATS:   '/api/v1/organizer/dashboard/stats',
    TICKETS:           '/api/v1/organizer/tickets',
    GENERATE_TICKETS:  '/api/v1/organizer/tickets/generate',
    REDEMPTIONS:       '/api/v1/organizer/redemptions',
    LIVE_MONITOR:      '/api/v1/organizer/live-monitor',
    COUNTERS:          '/api/v1/organizer/counters',
    GATES:             '/api/v1/organizer/gates',
    STAFF:             '/api/v1/organizer/staff',
    WRISTBAND_INVENTORY: '/api/v1/organizer/wristband-inventory',
    WRISTBAND_GUIDE:   '/api/v1/organizer/wristband-guide',
  },

  // Counter (COUNTER_STAFF)
  COUNTER: {
    SCAN_REDEEM:     '/api/v1/counter/scan',
    MY_REDEMPTIONS:  '/api/v1/counter/redemptions',
    STATUS:          '/api/v1/counter/status',
    INVENTORY:       '/api/v1/counter/inventory',
    GUIDE:           '/api/v1/counter/guide',
    HELP:            '/api/v1/counter/help',
  },

  // Gate (GATE_STAFF)
  GATE: {
    SCAN:         '/api/v1/gate/scan',
    LOGS:         '/api/v1/gate/logs',
    STATUS:       '/api/v1/gate/status',
    PROFILE:      '/api/v1/gate/profile',
  },

  // Admin (SUPER_ADMIN | ADMIN)
  ADMIN: {
    DASHBOARD:      '/api/v1/admin/dashboard',
    ANALYTICS:      '/api/v1/admin/analytics',
    ORDERS:         '/api/v1/admin/orders',
    USERS:          '/api/v1/admin/users',
    EVENTS:         '/api/v1/admin/events',
    TICKETS:        '/api/v1/admin/tickets',
    STAFF:          '/api/v1/admin/staff',
    COUNTERS:       '/api/v1/admin/counters',
    GATE_MANAGE:    '/api/v1/admin/gates',
    GATE_MONITOR:   '/api/v1/admin/gate-monitoring',
    VERIFICATIONS:  '/api/v1/admin/verifications',
    SEATS:          '/api/v1/admin/seats',
    SETTINGS:       '/api/v1/admin/settings',
    CREW_GATES:     '/api/v1/admin/crew-gates',
    LIVE_MONITOR:   '/api/v1/admin/live-monitor',
  },

  // Payment
  PAYMENT: {
    CREATE:         '/api/v1/payment/create',
    CALLBACK:       '/api/v1/payment/callback',
    STATUS:         (orderId: string) => `/api/v1/payment/status/${orderId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST:           '/api/v1/notifications',
    MARK_READ:      (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ:  '/api/v1/notifications/read-all',
  },

  // WebSocket
  WS: {
    LIVE:           '/ws/live',
  },
} as const

// ─── AUTH TOKEN HELPERS ────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sele_access_token')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sele_refresh_token')
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('sele_access_token', access)
  localStorage.setItem('sele_refresh_token', refresh)
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('sele_access_token')
  localStorage.removeItem('sele_refresh_token')
}

// ─── GENERIC FETCH WRAPPER ─────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
  timeout?: number
}

class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, timeout = 15000, headers: customHeaders, ...fetchOptions } = options

  // Build URL with query params
  let url = `${getBaseUrl()}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  // Add auth token if available
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Timeout controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.error || `HTTP ${response.status}`,
        data
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout')
    }
    throw new ApiError(500, 'Network error. Please try again.')
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── TYPED API METHODS ─────────────────────────────────────────────────────

// Auth
export const authApi = {
  googleLogin: (token: string) =>
    apiFetch<{ user: unknown; accessToken: string; refreshToken: string }>(
      API.AUTH.GOOGLE_LOGIN,
      { method: 'POST', body: JSON.stringify({ token }) }
    ),

  refreshToken: (refreshToken: string) =>
    apiFetch<{ accessToken: string; refreshToken: string }>(
      API.AUTH.REFRESH_TOKEN,
      { method: 'POST', body: JSON.stringify({ refreshToken }) }
    ),

  getMe: () =>
    apiFetch<{ user: unknown }>(API.AUTH.ME),

  logout: () =>
    apiFetch<void>(API.AUTH.LOGOUT, { method: 'POST' }),
}

// Tickets
export const ticketApi = {
  checkTicket: (ticketCode: string) =>
    apiFetch<ICheckTicketResponse>(
      API.PUBLIC.CHECK_TICKET,
      { method: 'POST', body: JSON.stringify({ ticketCode } as ICheckTicketRequest) }
    ),
}

// Organizer
export const organizerApi = {
  getDashboardStats: () =>
    apiFetch<{ kpis: IDashboardKPIs; liveStats: ILiveStats }>(
      API.ORGANIZER.DASHBOARD_STATS
    ),

  getRedemptions: (params?: Record<string, string>) =>
    apiFetch<{ data: unknown[]; total: number }>(
      API.ORGANIZER.REDEMPTIONS,
      { params }
    ),

  getLiveMonitor: () =>
    apiFetch<ILiveStats>(API.ORGANIZER.LIVE_MONITOR),
}

// Counter
export const counterApi = {
  scanAndRedeem: (data: IRedeemTicketRequest) =>
    apiFetch<IRedeemTicketResponse>(
      API.COUNTER.SCAN_REDEEM,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getMyRedemptions: (params?: Record<string, string>) =>
    apiFetch<{ data: unknown[]; total: number }>(
      API.COUNTER.MY_REDEMPTIONS,
      { params }
    ),

  getStatus: () =>
    apiFetch<{ counter: unknown; stats: unknown }>(API.COUNTER.STATUS),

  getInventory: () =>
    apiFetch<{ inventory: unknown[] }>(API.COUNTER.INVENTORY),
}

// Gate
export const gateApi = {
  scanTicket: (data: IGateScanRequest) =>
    apiFetch<IGateScanResponse>(
      API.GATE.SCAN,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getLogs: (params?: Record<string, string>) =>
    apiFetch<{ data: unknown[]; total: number }>(
      API.GATE.LOGS,
      { params }
    ),

  getStatus: () =>
    apiFetch<{ gate: unknown; stats: unknown }>(API.GATE.STATUS),

  getProfile: () =>
    apiFetch<{ staff: unknown; gate: unknown }>(API.GATE.PROFILE),
}

// ─── DEFAULT EXPORT ────────────────────────────────────────────────────────

export { ApiError }
export default apiFetch
