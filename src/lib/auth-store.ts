import { create } from 'zustand'
import type { UserRole, UserStatus, IOrder } from '@/lib/types'
import type { User } from '@/lib/mock-data'
import { mockUser, mockOrders } from '@/lib/mock-data'
import { setTokens, clearTokens, getAccessToken, apiFetch } from '@/lib/api'

// ─── GOOGLE OAUTH CONFIG ──────────────────────────────────────────────────

export const GOOGLE_CLIENT_ID = '503551786622-k3uajo9c2d6om6qnqofsa3b47fvo5o6g.apps.googleusercontent.com'

// ─── TYPES ─────────────────────────────────────────────────────────────────

interface AuthUser extends User {
  role: UserRole
  status: UserStatus
}

interface AuthState {
  // State
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  orders: IOrder[]
  accessToken: string | null
  refreshToken: string | null

  // Actions
  login: () => Promise<void>
  loginAsRole: (role: UserRole) => Promise<void>
  logout: () => void
  setTokens: (access: string, refresh: string) => void
  addOrder: (order: IOrder) => void
  updateOrder: (orderId: string, updates: Partial<IOrder>) => void
  getOrder: (orderId: string) => IOrder | undefined
  hasRole: (...roles: UserRole[]) => boolean
}

// ─── ROLE-BASED MOCK USERS ─────────────────────────────────────────────────

const MOCK_USERS_BY_ROLE: Record<UserRole, AuthUser> = {
  SUPER_ADMIN: {
    id: 'user-superadmin',
    name: 'Bukdan Admin',
    email: 'bukdan@seleevent.id',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bukdan',
    phone: '081200001111',
    role: 'SUPER_ADMIN',
    status: 'active',
  },
  ADMIN: {
    id: 'user-admin',
    name: 'Rizky Pratama',
    email: 'rizky@seleevent.id',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rizky',
    phone: '081200002222',
    role: 'ADMIN',
    status: 'active',
  },
  ORGANIZER: {
    id: 'user-organizer',
    name: 'Andi Wijaya',
    email: 'andi.wijaya@gmail.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andi',
    phone: '081200003333',
    role: 'ORGANIZER',
    status: 'active',
  },
  COUNTER_STAFF: {
    id: 'user-counter',
    name: 'Rina Wulandari',
    email: 'rina.w@gmail.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rina',
    phone: '081200006666',
    role: 'COUNTER_STAFF',
    status: 'active',
  },
  GATE_STAFF: {
    id: 'user-gate',
    name: 'Bayu Aditya',
    email: 'bayu.a@gmail.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bayu',
    phone: '081200020001',
    role: 'GATE_STAFF',
    status: 'active',
  },
  PARTICIPANT: {
    ...mockUser,
    role: 'PARTICIPANT',
    status: 'active',
  },
}

// ─── DASHBOARD ROUTES BY ROLE ──────────────────────────────────────────────

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  COUNTER_STAFF: '/counter',
  GATE_STAFF: '/gate',
  PARTICIPANT: '/',
}

// ─── ROLE LABELS ──────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  ORGANIZER: 'Organizer',
  COUNTER_STAFF: 'Counter Staff',
  GATE_STAFF: 'Gate Staff',
  PARTICIPANT: 'Peserta',
}

// ─── ROLE BADGE COLORS ────────────────────────────────────────────────────

export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  ADMIN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ORGANIZER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  COUNTER_STAFF: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  GATE_STAFF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PARTICIPANT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

// ─── GOOGLE OAUTH HELPER ─────────────────────────────────────────────────

// Load Google Identity Services script dynamically
function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).google?.accounts) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

// Get Google ID token using One Tap / popup
async function getGoogleIdToken(): Promise<string> {
  await loadGIS()

  const google = (window as unknown as { google: { accounts: { id: { initialize: (config: Record<string, unknown>) => void; prompt: (callback: (notification: Record<string, unknown>) => void) => void; renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void } } } }).google

  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          resolve(response.credential)
        } else {
          reject(new Error('No credential received'))
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    google.accounts.id.prompt((notification: Record<string, unknown>) => {
      if (notification.isNotDisplayed) {
        // If One Tap is not displayed, render a button instead
        reject(new Error('Google One Tap not available'))
      }
      if (notification.isSkippedMoment) {
        reject(new Error('Google sign-in was skipped'))
      }
    })
  })
}

// ─── STORE ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  orders: [],
  accessToken: typeof window !== 'undefined' ? getAccessToken() : null,
  refreshToken: null,

  login: async () => {
    set({ isLoading: true })
    try {
      // Step 1: Get Google ID token (real OAuth)
      const googleIdToken = await getGoogleIdToken()

      // Step 2: Send to our backend for verification + JWT generation
      const response = await apiFetch<{
        success: boolean
        user: AuthUser
        accessToken: string
        refreshToken: string
        expiresIn: number
      }>('/api/v1/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: googleIdToken }),
      })

      // Step 3: Store tokens
      setTokens(response.accessToken, response.refreshToken)

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        orders: mockOrders as unknown as IOrder[],
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
    } catch (error) {
      console.error('Google login failed:', error)
      // Fallback to mock login for development
      const mockTokens = {
        access: 'mock_access_token_' + Date.now(),
        refresh: 'mock_refresh_token_' + Date.now(),
      }
      setTokens(mockTokens.access, mockTokens.refresh)
      set({
        user: MOCK_USERS_BY_ROLE.PARTICIPANT,
        isAuthenticated: true,
        isLoading: false,
        orders: mockOrders as unknown as IOrder[],
        accessToken: mockTokens.access,
        refreshToken: mockTokens.refresh,
      })
    }
  },

  loginAsRole: async (role: UserRole) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockTokens = {
      access: `mock_token_${role.toLowerCase()}_${Date.now()}`,
      refresh: `mock_refresh_${role.toLowerCase()}_${Date.now()}`,
    }

    setTokens(mockTokens.access, mockTokens.refresh)

    set({
      user: MOCK_USERS_BY_ROLE[role],
      isAuthenticated: true,
      isLoading: false,
      accessToken: mockTokens.access,
      refreshToken: mockTokens.refresh,
    })
  },

  logout: () => {
    clearTokens()
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      orders: [],
      accessToken: null,
      refreshToken: null,
    })
  },

  setTokens: (access: string, refresh: string) => {
    setTokens(access, refresh)
    set({ accessToken: access, refreshToken: refresh })
  },

  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }))
  },

  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
    }))
  },

  getOrder: (orderId) => {
    return get().orders.find((o) => o.id === orderId)
  },

  hasRole: (...roles) => {
    const user = get().user
    if (!user) return false
    return roles.includes(user.role)
  },
}))
