// ─── SELEEVENT CUSTOM REACT QUERY HOOKS ────────────────────────────────────
// All server state goes through TanStack React Query hooks
// Zustand is only for client-side state (auth, UI)

'use client'

import { useState, useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  authApi,
  publicApi,
  orderApi,
  paymentApi,
  organizerApi,
  counterApi,
  gateApi,
  adminApi,
  notificationApi,
  type PaginatedData,
} from '@/lib/api'

import { useAuthStore } from '@/lib/auth-store'
import { getSSEClient } from '@/lib/sse'

import type {
  IUser,
  IEvent,
  ITicketType,
  IOrder,
  ITicket,
  INotification,
  IPaymentStatus,
  ICreateOrderRequest,
  ICreatePaymentRequest,
  ICreatePaymentResponse,
  ICheckTicketResponse,
  IRedeemTicketRequest,
  IRedeemTicketResponse,
  IGateScanRequest,
  IGateScanResponse,
  ISSEEvent,
} from '@/lib/types'

// ─── QUERY KEY FACTORY ────────────────────────────────────────────────────

export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },

  // Public
  events: {
    all: ['events', 'all'] as const,
    detail: (slug: string) => ['events', 'detail', slug] as const,
    ticketTypes: (eventId: string) => ['events', 'ticketTypes', eventId] as const,
  },

  // Orders
  orders: {
    list: (params?: Record<string, string>) => ['orders', 'list', params] as const,
    detail: (orderId: string) => ['orders', 'detail', orderId] as const,
  },

  // Payment
  payment: {
    status: (orderId: string) => ['payment', 'status', orderId] as const,
  },

  // Organizer
  organizer: {
    dashboard: (eventId?: string) => ['organizer', 'dashboard', eventId] as const,
    liveMonitor: (eventId?: string) => ['organizer', 'liveMonitor', eventId] as const,
    redemptions: (params?: Record<string, string>) => ['organizer', 'redemptions', params] as const,
    counters: (params?: Record<string, string>) => ['organizer', 'counters', params] as const,
    gates: (params?: Record<string, string>) => ['organizer', 'gates', params] as const,
    tickets: (params?: Record<string, string>) => ['organizer', 'tickets', params] as const,
    staff: (params?: Record<string, string>) => ['organizer', 'staff', params] as const,
    wristbandInventory: (params?: Record<string, string>) => ['organizer', 'wristbandInventory', params] as const,
    wristbandGuide: () => ['organizer', 'wristbandGuide'] as const,
  },

  // Counter
  counter: {
    redemptions: (params?: Record<string, string>) => ['counter', 'redemptions', params] as const,
    status: () => ['counter', 'status'] as const,
    inventory: () => ['counter', 'inventory'] as const,
    guide: () => ['counter', 'guide'] as const,
  },

  // Gate
  gate: {
    logs: (params?: Record<string, string>) => ['gate', 'logs', params] as const,
    status: () => ['gate', 'status'] as const,
    profile: () => ['gate', 'profile'] as const,
  },

  // Admin
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    orders: (params?: Record<string, string>) => ['admin', 'orders', params] as const,
    users: (params?: Record<string, string>) => ['admin', 'users', params] as const,
    events: (params?: Record<string, string>) => ['admin', 'events', params] as const,
    analytics: (eventId?: string) => ['admin', 'analytics', eventId] as const,
    tickets: (params?: Record<string, string>) => ['admin', 'tickets', params] as const,
    staff: (params?: Record<string, string>) => ['admin', 'staff', params] as const,
    counters: (params?: Record<string, string>) => ['admin', 'counters', params] as const,
    gates: (params?: Record<string, string>) => ['admin', 'gates', params] as const,
    gateMonitoring: (eventId?: string) => ['admin', 'gateMonitoring', eventId] as const,
    verifications: (params?: Record<string, string>) => ['admin', 'verifications', params] as const,
    seats: (eventId?: string) => ['admin', 'seats', eventId] as const,
    settings: () => ['admin', 'settings'] as const,
    crewGates: (params?: Record<string, string>) => ['admin', 'crewGates', params] as const,
    liveMonitor: (eventId?: string) => ['admin', 'liveMonitor', eventId] as const,
  },

  // Notifications
  notifications: {
    list: (params?: Record<string, string>) => ['notifications', 'list', params] as const,
  },

  // SSE
  sse: {
    status: () => ['sse', 'status'] as const,
  },
}

// ─── AUTH HOOKS ────────────────────────────────────────────────────────────

/**
 * useAuth() — wraps the auth Zustand store for easy access in components
 * Returns the full auth store state and actions
 */
export function useAuth() {
  return useAuthStore()
}

/**
 * useAuthQuery() — React Query hook for fetching current user profile
 * Use this for components that need to refetch/invalidate auth state
 */
export function useAuthQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.getMe(),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('sele_access_token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => authApi.googleLogin(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Always clear cache on logout, even if API call fails
      queryClient.clear()
    },
  })
}

// ─── EVENT HOOKS ───────────────────────────────────────────────────────────

/**
 * useEvents() — fetches all available events
 */
export function useEvents(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.events(params),
    queryFn: () => adminApi.getEvents(params),
  })
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: () => publicApi.getEventBySlug(slug),
    enabled: !!slug,
  })
}

export function useTicketTypes(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.ticketTypes(eventId),
    queryFn: () => publicApi.getTicketTypes(eventId),
    enabled: !!eventId,
  })
}

// ─── ORDER HOOKS ───────────────────────────────────────────────────────────

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ICreateOrderRequest) => orderApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

/**
 * useOrders() — fetches user orders with optional params
 */
export function useOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => orderApi.getUserOrders(params),
  })
}

// Alias for backward compatibility
export function useUserOrders(params?: Record<string, string>) {
  return useOrders(params)
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderApi.getOrderDetail(orderId),
    enabled: !!orderId,
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ─── PAYMENT HOOKS ─────────────────────────────────────────────────────────

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ICreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payment.status(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function usePaymentStatus(orderId: string) {
  return useQuery({
    queryKey: queryKeys.payment.status(orderId),
    queryFn: () => paymentApi.getPaymentStatus(orderId),
    enabled: !!orderId,
    refetchInterval: (query) => {
      // Stop polling when payment is settled
      const data = query.state.data as IPaymentStatus | undefined
      if (data && ['paid', 'cancelled', 'expired'].includes(data.orderStatus)) {
        return false
      }
      return 5000 // Poll every 5 seconds while pending
    },
  })
}

// ─── SSE HOOK ──────────────────────────────────────────────────────────────

/**
 * useSSE() — connects to SSE stream and returns connection status
 * Automatically reconnects using the SSE client singleton
 */
export function useSSE() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [lastEvent, setLastEvent] = useState<ISSEEvent | null>(null)

  useEffect(() => {
    const sse = getSSEClient()

    // Subscribe to status changes — the subscription callback will update state
    const unsubStatus = sse.onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    // Subscribe to all events
    const unsubEvents = sse.on('*', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data)
        setLastEvent(parsed as ISSEEvent)
      } catch {
        // Ignore malformed events
      }
    })

    return () => {
      unsubStatus()
      unsubEvents()
    }
  }, [])

  return { status, lastEvent }
}

// ─── COUNTER HOOKS ─────────────────────────────────────────────────────────

export function useCounterScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IRedeemTicketRequest) => counterApi.scanAndRedeem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counter'] })
    },
  })
}

export function useCounterRedemptions(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.counter.redemptions(params),
    queryFn: () => counterApi.getRedemptions(params),
  })
}

export function useCounterStatus() {
  return useQuery({
    queryKey: queryKeys.counter.status(),
    queryFn: () => counterApi.getStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useCounterInventory() {
  return useQuery({
    queryKey: queryKeys.counter.inventory(),
    queryFn: () => counterApi.getInventory(),
  })
}

export function useCounterGuide() {
  return useQuery({
    queryKey: queryKeys.counter.guide(),
    queryFn: () => counterApi.getGuide(),
  })
}

// ─── GATE HOOKS ────────────────────────────────────────────────────────────

export function useGateScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IGateScanRequest) => gateApi.scanTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate'] })
    },
  })
}

export function useGateLogs(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.gate.logs(params),
    queryFn: () => gateApi.getLogs(params),
  })
}

export function useGateStatus() {
  return useQuery({
    queryKey: queryKeys.gate.status(),
    queryFn: () => gateApi.getStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useGateProfile() {
  return useQuery({
    queryKey: queryKeys.gate.profile(),
    queryFn: () => gateApi.getProfile(),
  })
}

// ─── ORGANIZER HOOKS ───────────────────────────────────────────────────────

export function useOrganizerDashboard(eventId: string) {
  return useQuery({
    queryKey: queryKeys.organizer.dashboard(eventId),
    queryFn: () => organizerApi.getDashboardStats(eventId),
    enabled: !!eventId,
    refetchInterval: 15000, // Refresh every 15 seconds for live dashboard
  })
}

export function useOrganizerLiveMonitor(eventId: string) {
  return useQuery({
    queryKey: queryKeys.organizer.liveMonitor(eventId),
    queryFn: () => organizerApi.getLiveMonitor(eventId),
    enabled: !!eventId,
    refetchInterval: 5000, // Refresh every 5 seconds for live monitor
  })
}

export function useOrganizerRedemptions(eventId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.organizer.redemptions({ eventId, ...params }),
    queryFn: () => organizerApi.getRedemptions({ eventId, ...params }),
    enabled: !!eventId,
  })
}

export function useOrganizerCounters(eventId: string) {
  return useQuery({
    queryKey: queryKeys.organizer.counters({ eventId }),
    queryFn: () => organizerApi.getCounters({ eventId }),
    enabled: !!eventId,
  })
}

export function useOrganizerGates(eventId: string) {
  return useQuery({
    queryKey: queryKeys.organizer.gates({ eventId }),
    queryFn: () => organizerApi.getGates({ eventId }),
    enabled: !!eventId,
  })
}

export function useOrganizerTickets(eventId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.organizer.tickets({ eventId, ...params }),
    queryFn: () => organizerApi.getTickets({ eventId, ...params }),
    enabled: !!eventId,
  })
}

export function useOrganizerStaff(eventId: string) {
  return useQuery({
    queryKey: queryKeys.organizer.staff({ eventId }),
    queryFn: () => organizerApi.getStaff({ eventId }),
    enabled: !!eventId,
  })
}

export function useOrganizerWristbandInventory(eventId: string) {
  return useQuery({
    queryKey: queryKeys.organizer.wristbandInventory({ eventId }),
    queryFn: () => organizerApi.getWristbandInventory({ eventId }),
    enabled: !!eventId,
  })
}

export function useOrganizerWristbandGuide() {
  return useQuery({
    queryKey: queryKeys.organizer.wristbandGuide(),
    queryFn: () => organizerApi.getWristbandGuide(),
  })
}

// ─── ADMIN HOOKS ───────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => adminApi.getDashboard(),
    refetchInterval: 15000,
  })
}

export function useAdminOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.orders(params),
    queryFn: () => adminApi.getOrders(params),
  })
}

export function useAdminUsers(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.getUsers(params),
  })
}

export function useAdminEvents(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.events(params),
    queryFn: () => adminApi.getEvents(params),
  })
}

export function useAdminAnalytics(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.admin.analytics(eventId),
    queryFn: () => adminApi.getAnalytics(eventId),
    enabled: !!eventId,
  })
}

export function useAdminTickets(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.tickets(params),
    queryFn: () => adminApi.getTickets(params),
  })
}

export function useAdminStaff(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.staff(params),
    queryFn: () => adminApi.getStaff(params),
  })
}

export function useAdminCounters(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.counters(params),
    queryFn: () => adminApi.getCounters(params),
  })
}

export function useAdminGates(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.gates(params),
    queryFn: () => adminApi.getGates(params),
  })
}

export function useAdminGateMonitoring(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.admin.gateMonitoring(eventId),
    queryFn: () => adminApi.getGateMonitoring(eventId),
    refetchInterval: 5000,
  })
}

export function useAdminVerifications(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.verifications(params),
    queryFn: () => adminApi.getVerifications(params),
  })
}

export function useAdminSeats(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.admin.seats(eventId),
    queryFn: () => adminApi.getSeats(eventId),
    enabled: !!eventId,
  })
}

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: () => adminApi.getSettings(),
    staleTime: 60 * 1000, // 1 minute — settings rarely change
  })
}

export function useAdminCrewGates(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.crewGates(params),
    queryFn: () => adminApi.getCrewGates(params),
  })
}

export function useAdminLiveMonitor(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.admin.liveMonitor(eventId),
    queryFn: () => adminApi.getLiveMonitor(eventId),
    refetchInterval: 5000,
  })
}

export function useCancelTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: string) => adminApi.cancelTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useExpirePendingTickets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminApi.expirePendingTickets(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

// ─── NOTIFICATION HOOKS ────────────────────────────────────────────────────

export function useNotifications(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getNotifications(params),
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ─── PUBLIC TICKET CHECK HOOK ──────────────────────────────────────────────

export function useCheckTicket() {
  return useMutation({
    mutationFn: (ticketCode: string) => publicApi.checkTicket(ticketCode),
  })
}
