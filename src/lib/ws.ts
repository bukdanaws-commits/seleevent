// ─── SELEEVENT WEBSOCKET CLIENT ────────────────────────────────────────────
// Real-time connection to Golang Fiber WebSocket hub
// Used for: Counter↔Gate↔Admin live sync

import type { IWSMessage } from './types'

type WSMessageHandler = (message: IWSMessage) => void
type WSStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void

interface WSClientOptions {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  onMessage?: WSMessageHandler
  onStatusChange?: WSStatusHandler
  onReconnect?: () => void
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectInterval: number
  private maxReconnectAttempts: number
  private heartbeatInterval: number
  private reconnectAttempts: number = 0
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private messageHandlers: Map<string, WSMessageHandler[]> = new Map()
  private statusHandlers: WSStatusHandler[] = []
  private _status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected'
  private token: string | null = null

  constructor(options: WSClientOptions = {}) {
    const GO_BACKEND_PORT = process.env.NEXT_PUBLIC_GO_PORT || '8080'
    this.url = options.url || `/?XTransformPort=${GO_BACKEND_PORT}`
    this.reconnectInterval = options.reconnectInterval || 3000
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10
    this.heartbeatInterval = options.heartbeatInterval || 30000

    if (options.onMessage) {
      this.on('*', options.onMessage)
    }
    if (options.onStatusChange) {
      this.onStatusChange(options.onStatusChange)
    }
  }

  get status() {
    return this._status
  }

  // ─── CONNECTION ──────────────────────────────────────────────────────────

  connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.token = token || this.token
    this._updateStatus('connecting')

    try {
      const wsUrl = this.url.startsWith('ws')
        ? this.url
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${this.url}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this._updateStatus('connected')
        this.reconnectAttempts = 0
        this._startHeartbeat()

        // Send auth message after connection
        if (this.token) {
          this.send({ type: 'auth', data: { token: this.token }, timestamp: new Date().toISOString() })
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message: IWSMessage = JSON.parse(event.data)
          this._handleMessage(message)
        } catch {
          // Ignore malformed messages
        }
      }

      this.ws.onclose = (event) => {
        this._updateStatus('disconnected')
        this._stopHeartbeat()

        // Auto-reconnect unless intentional close
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this._scheduleReconnect()
        }
      }

      this.ws.onerror = () => {
        this._updateStatus('error')
      }
    } catch {
      this._updateStatus('error')
      this._scheduleReconnect()
    }
  }

  disconnect(): void {
    this._stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this._updateStatus('disconnected')
  }

  // ─── MESSAGING ───────────────────────────────────────────────────────────

  send(message: IWSMessage): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false
    try {
      this.ws.send(JSON.stringify(message))
      return true
    } catch {
      return false
    }
  }

  sendAction(type: IWSMessage['type'], data: unknown): boolean {
    return this.send({
      type,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  // ─── EVENT HANDLERS ──────────────────────────────────────────────────────

  on(type: string | '*', handler: WSMessageHandler): () => void {
    const handlers = this.messageHandlers.get(type) || []
    handlers.push(handler)
    this.messageHandlers.set(type, handlers)

    // Return unsubscribe function
    return () => {
      const current = this.messageHandlers.get(type) || []
      this.messageHandlers.set(type, current.filter(h => h !== handler))
    }
  }

  onStatusChange(handler: WSStatusHandler): () => void {
    this.statusHandlers.push(handler)
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler)
    }
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────

  private _handleMessage(message: IWSMessage): void {
    // Call wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*') || []
    wildcardHandlers.forEach(h => h(message))

    // Call type-specific handlers
    const typeHandlers = this.messageHandlers.get(message.type) || []
    typeHandlers.forEach(h => h(message))
  }

  private _updateStatus(status: typeof this._status): void {
    this._status = status
    this.statusHandlers.forEach(h => h(status))
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', data: null, timestamp: new Date().toISOString() })
    }, this.heartbeatInterval)
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    )
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }
}

// ─── SINGLETON EXPORT ──────────────────────────────────────────────────────

let wsClient: WebSocketClient | null = null

export function getWSClient(options?: WSClientOptions): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(options)
  }
  return wsClient
}

export function disconnectWS(): void {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}

export { WebSocketClient }
export default getWSClient
