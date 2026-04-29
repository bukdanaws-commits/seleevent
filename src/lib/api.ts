// ─── SELEEVENT API CLIENT ──────────────────────────────────────────────────
// Centralized API endpoint constants + fetch client
// Backend: Golang Fiber v2 (Port 8080)
//
// Three deployment modes:
//   1. LOCAL DEV (Caddy gateway): requests go through Caddy via XTransformPort
//      - NEXT_PUBLIC_USE_DIRECT_BACKEND is NOT set (or 'false')
//      - NEXT_PUBLIC_API_URL is empty or not set
//      - URL pattern: /?XTransformPort=8080/api/v1/...
//
//   2. CLOUD RUN (direct backend): FE calls BE via its Cloud Run URL directly
//      - NEXT_PUBLIC_USE_DIRECT_BACKEND=true
//      - NEXT_PUBLIC_API_URL=https://eventku-api-xxxxx-xx.a.run.app
//      - No Caddy proxy — FE → BE directly
//
//   3. MOCK MODE: FE calls local Next.js API routes that serve mock data
//      - NEXT_PUBLIC_MOCK_MODE=true
//      - URL pattern: /api/v1/... (no XTransformPort, no external backend)
//      - Used for dashboard simulation without running the Go backend

import type {
  ICheckTicketRequest,
  ICheckTicketResponse,
  IRedeemTicketRequest,
  IRedeemTicketResponse,
  IGateScanRequest,
  IGateScanResponse,
  ILiveStats,
  IDashboardKPIs,
  ICreateOrderRequest,
  ICreatePaymentRequest,
  ICreatePaymentResponse,
  IPaymentStatus,
  IPagination,
} from './types'

// ─── CONFIG ─────────────────────────────────────────────────────────────────

// Mock mode: FE calls local Next.js API routes instead of Go backend
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

// Cloud Run: full backend URL (e.g. https://eventku-api-xxxxx.a.run.app)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Local dev: Golang backend port for XTransformPort gateway (Caddy proxy)
const GO_BACKEND_PORT = process.env.NEXT_PUBLIC_GO_PORT || '8080'

// Cloud Run mode: FE calls BE directly via API_BASE URL (no Caddy)
// Local dev mode: FE goes through Caddy XTransformPort proxy
const USE_DIRECT_BACKEND = process.env.NEXT_PUBLIC_USE_DIRECT_BACKEND === 'true'

function getBaseUrl(): string {
  // Mock mode: use local Next.js API routes (no port forwarding needed)
  if (MOCK_MODE) {
    return ''
  }
  if (USE_DIRECT_BACKEND && API_BASE) {
    // Cloud Run: use the full backend URL directly (no Caddy proxy)
    return API_BASE
  }
  // Local dev: route through Caddy gateway via XTransformPort
  return `/?XTransformPort=${GO_BACKEND_PORT}`
}

// ─── API ENDPOINTS (matching Golang Fiber routes.go) ──────────────────────

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
    EVENTS:          '/api/v1/events',
    CHECK_TICKET:   '/api/v1/tickets/check',
    EVENT_DETAIL:   (slug: string) => `/api/v1/events/${slug}`,
    TICKET_TYPES:   (eventId: string) => `/api/v1/events/${eventId}/ticket-types`,
  },

  // Orders
  ORDERS: {
    CREATE:         '/api/v1/orders',
    LIST:           '/api/v1/orders',
    DETAIL:         (orderId: string) => `/api/v1/orders/${orderId}`,
    CANCEL:         (orderId: string) => `/api/v1/orders/${orderId}/cancel`,
  },

  // Payment
  PAYMENT: {
    CREATE:         '/api/v1/payment/create',
    CREATE_DIRECT:  '/api/v1/payment/create-direct',
    CALLBACK:       '/api/v1/payment/callback',
    STATUS:         (orderId: string) => `/api/v1/payment/status/${orderId}`,
  },

  // Organizer (SUPER_ADMIN | ADMIN | ORGANIZER)
  ORGANIZER: {
    DASHBOARD_STATS:   '/api/v1/organizer/dashboard/stats',
    TICKETS:           '/api/v1/organizer/tickets',
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
    CANCEL_TICKET:  (ticketId: string) => `/api/v1/admin/tickets/${ticketId}/cancel`,
    EXPIRE_PENDING: '/api/v1/admin/tickets/expire-pending',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST:           '/api/v1/notifications',
    MARK_READ:      (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ:  '/api/v1/notifications/read-all',
  },

  // SSE
  SSE: {
    STREAM:        '/api/v1/sse/stream',
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

// ─── GENERIC FETCH WRAPPER WITH ENVELOPE UNWRAPPING ──────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
  timeout?: number
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Paginated data type for hooks
export interface PaginatedData<T> {
  data: T[]
  pagination: IPagination
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

    const json = await response.json()

    // ─── 401 AUTO-REFRESH ──────────────────────────────────────────────────
    if (response.status === 401 && getRefreshToken()) {
      try {
        const refreshResult = await authApi.refreshToken(getRefreshToken()!)
        setTokens(refreshResult.accessToken, refreshResult.refreshToken)
        // Retry the original request with new token
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(customHeaders as Record<string, string>),
          Authorization: `Bearer ${refreshResult.accessToken}`,
        }
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
        })
        const retryJson = await retryResponse.json()
        // Process retry response
        if (typeof retryJson.success === 'boolean') {
          if (!retryJson.success) {
            throw new ApiError(retryResponse.status, retryJson.error || retryJson.message || 'Request failed', retryJson)
          }
          if (retryJson.pagination || retryJson.meta) {
            const rawMeta = retryJson.meta || retryJson.pagination
            const pagination: IPagination = {
              total: rawMeta.total ?? rawMeta.total_count ?? 0,
              page: rawMeta.page ?? rawMeta.current_page ?? 1,
              perPage: rawMeta.perPage ?? rawMeta.per_page ?? 20,
              totalPages: rawMeta.totalPages ?? rawMeta.total_pages ?? 1,
            }
            return { data: retryJson.data, pagination } as T
          }
          return retryJson.data as T
        }
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, retryJson.message || retryJson.error || `HTTP ${retryResponse.status}`, retryJson)
        }
        return retryJson as T
      } catch (refreshError) {
        // Refresh failed — clear tokens and throw
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        throw new ApiError(401, 'Session expired. Please login again.')
      }
    }

    // ─── UNWRAP BACKEND RESPONSE ENVELOPE ─────────────────────────────────
    // Backend returns: { success: true, data: {...}, meta/pagination: {...} }
    //                  { success: false, error: "..." }
    if (typeof json.success === 'boolean') {
      if (!json.success) {
        throw new ApiError(
          response.status,
          json.error || json.message || `Request failed`,
          json
        )
      }
      // Success response — unwrap data
      if (json.pagination || json.meta) {
        // Paginated response — return { data, pagination }
        // Normalize to camelCase (backend meta uses camelCase; legacy pagination may use snake_case)
        const rawMeta = json.meta || json.pagination
        const pagination: IPagination = {
          total: rawMeta.total ?? rawMeta.total_count ?? 0,
          page: rawMeta.page ?? rawMeta.current_page ?? 1,
          perPage: rawMeta.perPage ?? rawMeta.per_page ?? 20,
          totalPages: rawMeta.totalPages ?? rawMeta.total_pages ?? 1,
        }
        return {
          data: json.data,
          pagination,
        } as T
      }
      // Non-paginated — just return the data
      return json.data as T
    }

    // Fallback: no envelope, return raw JSON
    if (!response.ok) {
      throw new ApiError(
        response.status,
        json.message || json.error || `HTTP ${response.status}`,
        json
      )
    }

    return json as T
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
    apiFetch<{ user: unknown; accessToken: string; refreshToken: string; expiresIn: number }>(
      API.AUTH.GOOGLE_LOGIN,
      { method: 'POST', body: JSON.stringify({ token }) }
    ),

  refreshToken: (refreshToken: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      API.AUTH.REFRESH_TOKEN,
      { method: 'POST', body: JSON.stringify({ refreshToken }) }
    ),

  getMe: () =>
    apiFetch<{ user: unknown }>(API.AUTH.ME),

  logout: () =>
    apiFetch<void>(API.AUTH.LOGOUT, { method: 'POST' }),
}

// Public
export const publicApi = {
  getEvents: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(API.PUBLIC.EVENTS, { params }),

  getEventBySlug: (slug: string) =>
    apiFetch<{ event: unknown }>(API.PUBLIC.EVENT_DETAIL(slug)),

  getTicketTypes: (eventId: string) =>
    apiFetch<unknown[]>(API.PUBLIC.TICKET_TYPES(eventId)),

  checkTicket: (ticketCode: string) =>
    apiFetch<ICheckTicketResponse>(
      API.PUBLIC.CHECK_TICKET,
      { method: 'POST', body: JSON.stringify({ ticketCode } as ICheckTicketRequest) }
    ),
}

// Orders
export const orderApi = {
  createOrder: (data: ICreateOrderRequest) =>
    apiFetch<unknown>(API.ORDERS.CREATE, { method: 'POST', body: JSON.stringify(data) }),

  getUserOrders: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ORDERS.LIST, { params }),

  getOrderDetail: (orderId: string) =>
    apiFetch<unknown>(API.ORDERS.DETAIL(orderId)),

  cancelOrder: (orderId: string) =>
    apiFetch<void>(API.ORDERS.CANCEL(orderId), { method: 'POST' }),
}

// Payment
export const paymentApi = {
  createPayment: (data: ICreatePaymentRequest) =>
    apiFetch<ICreatePaymentResponse>(API.PAYMENT.CREATE, { method: 'POST', body: JSON.stringify(data) }),

  createDirectPayment: (data: ICreatePaymentRequest) =>
    apiFetch<ICreatePaymentResponse>(API.PAYMENT.CREATE_DIRECT, { method: 'POST', body: JSON.stringify(data) }),

  getPaymentStatus: (orderId: string) =>
    apiFetch<IPaymentStatus>(API.PAYMENT.STATUS(orderId)),
}

// Organizer
export const organizerApi = {
  getDashboardStats: (eventId: string) =>
    apiFetch<{ kpis: IDashboardKPIs; liveStats: ILiveStats }>(
      API.ORGANIZER.DASHBOARD_STATS,
      { params: { eventId } }
    ),

  getLiveMonitor: (eventId: string) =>
    apiFetch<ILiveStats>(API.ORGANIZER.LIVE_MONITOR, { params: { eventId } }),

  getRedemptions: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ORGANIZER.REDEMPTIONS, { params }),

  getCounters: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(API.ORGANIZER.COUNTERS, { params }),

  getGates: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(API.ORGANIZER.GATES, { params }),

  getTickets: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ORGANIZER.TICKETS, { params }),

  getStaff: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(API.ORGANIZER.STAFF, { params }),

  getWristbandInventory: (params?: Record<string, string>) =>
    apiFetch<{ inventory: unknown[] }>(API.ORGANIZER.WRISTBAND_INVENTORY, { params }),

  getWristbandGuide: () =>
    apiFetch<{ guide: unknown[] }>(API.ORGANIZER.WRISTBAND_GUIDE),
}

// Counter
export const counterApi = {
  scanAndRedeem: (data: IRedeemTicketRequest) =>
    apiFetch<IRedeemTicketResponse>(
      API.COUNTER.SCAN_REDEEM,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getRedemptions: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.COUNTER.MY_REDEMPTIONS, { params }),

  getStatus: () =>
    apiFetch<{ counter: unknown; stats: unknown }>(API.COUNTER.STATUS),

  getInventory: () =>
    apiFetch<{ inventory: unknown[] }>(API.COUNTER.INVENTORY),

  getGuide: () =>
    apiFetch<{ guide: unknown[] }>(API.COUNTER.GUIDE),
}

// Gate
export const gateApi = {
  scanTicket: (data: IGateScanRequest) =>
    apiFetch<IGateScanResponse>(
      API.GATE.SCAN,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getLogs: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.GATE.LOGS, { params }),

  getStatus: () =>
    apiFetch<{ gate: unknown; stats: unknown }>(API.GATE.STATUS),

  getProfile: () =>
    apiFetch<{ staff: unknown; gate: unknown; assignment: unknown; todayScans: number }>(API.GATE.PROFILE),
}

// Admin
export const adminApi = {
  getDashboard: () =>
    apiFetch<unknown>(API.ADMIN.DASHBOARD),

  getOrders: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.ORDERS, { params }),

  getUsers: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.USERS, { params }),

  getEvents: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(API.ADMIN.EVENTS, { params }),

  getAnalytics: (eventId?: string) =>
    apiFetch<unknown>(API.ADMIN.ANALYTICS, { params: eventId ? { eventId } : undefined }),

  getTickets: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.TICKETS, { params }),

  getStaff: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.STAFF, { params }),

  getCounters: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.COUNTERS, { params }),

  getGates: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.GATE_MANAGE, { params }),

  getGateMonitoring: (eventId?: string) =>
    apiFetch<unknown>(API.ADMIN.GATE_MONITOR, { params: eventId ? { eventId } : undefined }),

  getVerifications: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.VERIFICATIONS, { params }),

  getSeats: (eventId?: string) =>
    apiFetch<unknown>(API.ADMIN.SEATS, { params: eventId ? { eventId } : undefined }),

  getSettings: () =>
    apiFetch<unknown>(API.ADMIN.SETTINGS),

  getCrewGates: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.ADMIN.CREW_GATES, { params }),

  getLiveMonitor: (eventId?: string) =>
    apiFetch<unknown>(API.ADMIN.LIVE_MONITOR, { params: eventId ? { eventId } : undefined }),

  cancelTicket: (ticketId: string) =>
    apiFetch<void>(API.ADMIN.CANCEL_TICKET(ticketId), { method: 'PATCH' }),

  expirePendingTickets: () =>
    apiFetch<{ count: number }>(API.ADMIN.EXPIRE_PENDING, { method: 'POST' }),
}

// Notifications
export const notificationApi = {
  getNotifications: (params?: Record<string, string>) =>
    apiFetch<PaginatedData<unknown>>(API.NOTIFICATIONS.LIST, { params }),

  markAsRead: (id: string) =>
    apiFetch<void>(API.NOTIFICATIONS.MARK_READ(id), { method: 'PATCH' }),

  markAllAsRead: () =>
    apiFetch<void>(API.NOTIFICATIONS.MARK_ALL_READ, { method: 'POST' }),
}

// ─── DEFAULT EXPORT ────────────────────────────────────────────────────────

export default apiFetch
