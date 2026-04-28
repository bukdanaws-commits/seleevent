// ─── SEAT MANAGEMENT DATA LAYER ─────────────────────────────────────────────
// Dynamic, flexible seat configuration per ticket tier
// Admin can configure layout for any venue through the dashboard
// Unified with ISeat from types.ts for backend compatibility

import type { ISeat } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

// ─── TIER ID CONSTANTS (UUID format) ────────────────────────────────────────

export const TIER_IDS = {
  VVIP: 'a1b2c3d4-e5f6-7890-abcd-000000000001',
  VIP: 'a1b2c3d4-e5f6-7890-abcd-000000000002',
  FESTIVAL: 'a1b2c3d4-e5f6-7890-abcd-000000000003',
  CAT1: 'a1b2c3d4-e5f6-7890-abcd-000000000004',
  CAT2: 'a1b2c3d4-e5f6-7890-abcd-000000000005',
  CAT3: 'a1b2c3d4-e5f6-7890-abcd-000000000006',
  CAT4: 'a1b2c3d4-e5f6-7890-abcd-000000000007',
  CAT5: 'a1b2c3d4-e5f6-7890-abcd-000000000008',
  CAT6: 'a1b2c3d4-e5f6-7890-abcd-000000000009',
} as const

// Default tenant & event IDs for mock generation
const MOCK_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000'
const MOCK_EVENT_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type ZoneType = 'seated' | 'standing' | 'free'
export type SeatStatus = 'available' | 'reserved' | 'sold' | 'locked'
export type SeatSelectionMode = 'seatSelection' | 'autoAssign' | 'both'

export interface SeatConfig {
  tierId: string           // UUID from backend (ticket type ID)
  tierName: string
  emoji: string
  zoneType: ZoneType
  // Seated config
  totalRows: number       // number of rows (e.g. 10)
  seatsPerRow: number     // seats per row (e.g. 20)
  rowPrefix: string       // prefix for row labels ("A", "B", "AA", "AB")
  rowDelimiter: string    // delimiter between row and seat number ("", "-")
  seatNumberStart: number  // seat numbering starts from this (default: 1)
  // Standing config
  totalZones: number      // number of zones for standing
  // Common
  gate: string            // assigned gate for entry
  price: number
  quota: number
  sold: number
  // Hybrid seat selection mode
  seatSelectionMode: SeatSelectionMode  // 'seatSelection' | 'autoAssign' | 'both'
}

/** UI-specific seat display data derived from ISeat */
export interface SeatDisplay {
  id: string              // UUID from ISeat
  section: string         // from ISeat.section
  row: string             // from ISeat.row
  number: string          // from ISeat.number
  label: string           // from ISeat.label (e.g. "A-1-12")
  status: string          // from ISeat.status
  tierId?: string         // from ISeat.ticketTypeId
  tierName?: string       // for display
}

/**
 * Seat with legacy field aliases for backward compatibility during migration.
 * @deprecated Use SeatDisplay or ISeat instead. Legacy fields will be removed
 * once all consuming components are migrated to use ISeat/SeatDisplay fields.
 */
export interface Seat extends SeatDisplay {
  // ISeat additional fields (populated by mock generator for ISeat compatibility)
  tenantId?: string
  eventId?: string
  ticketTypeId?: string
  createdAt?: string
  updatedAt?: string
  // Legacy field aliases — map to ISeat fields:
  rowLabel: string        // alias for row ("A", "B", "AA" or "Zone" for standing)
  seatNumber: number      // alias for number (as number, for sorting/comparison)
  seatLabel: string       // alias for label ("A1", "A2", "B15" or "Zone 1")
  reservedAt?: string     // legacy field (not in ISeat, mapped from held status)
  reservedBy?: string     // legacy field (not in ISeat)
  orderId?: string        // legacy field (not in ISeat)
}

export interface SeatStats {
  total: number
  available: number
  reserved: number
  sold: number
  locked: number
}

export interface SeatSelection {
  tierId: string
  tierName: string
  seat: Seat
  mode: 'seatSelection' | 'autoAssign'
}

// ─── ISEAT → SEAT DISPLAY CONVERSION ────────────────────────────────────────

/** Convert ISeat to SeatDisplay for UI rendering */
export function iSeatToSeatDisplay(seat: ISeat, tierName?: string): SeatDisplay {
  return {
    id: seat.id,
    section: seat.section,
    row: seat.row,
    number: seat.number,
    label: seat.label,
    status: seat.status,
    tierId: seat.ticketTypeId,
    tierName: tierName,
  }
}

/** Convert ISeat to Seat (with legacy field aliases) for backward-compatible UI rendering */
export function iSeatToSeat(seat: ISeat, tierName?: string): Seat {
  // Map ISeat status to legacy SeatStatus
  let legacyStatus: SeatStatus = 'available'
  switch (seat.status) {
    case 'available': legacyStatus = 'available'; break
    case 'held': legacyStatus = 'reserved'; break
    case 'sold': legacyStatus = 'sold'; break
    case 'disabled': legacyStatus = 'locked'; break
    default: legacyStatus = 'available'
  }

  return {
    id: seat.id,
    section: seat.section,
    row: seat.row,
    number: seat.number,
    label: seat.label,
    status: legacyStatus,
    tierId: seat.ticketTypeId,
    tierName: tierName,
    tenantId: seat.tenantId,
    eventId: seat.eventId,
    ticketTypeId: seat.ticketTypeId,
    createdAt: seat.createdAt,
    updatedAt: seat.updatedAt,
    // Legacy aliases
    rowLabel: seat.row,
    seatNumber: parseInt(seat.number, 10) || 0,
    seatLabel: seat.label,
    reservedAt: seat.status === 'held' ? seat.updatedAt : undefined,
  }
}

// ─── DEFAULT SEAT CONFIGS ────────────────────────────────────────────────────
// Pre-configured for GBK Madya Stadium — admin can modify these

export const defaultSeatConfigs: SeatConfig[] = [
  {
    tierId: TIER_IDS.VVIP,
    tierName: 'VVIP PIT',
    emoji: '👑',
    zoneType: 'seated',
    totalRows: 15,
    seatsPerRow: 20,
    rowPrefix: 'V',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'VIP Gate',
    price: 3500000,
    quota: 300,
    sold: 247,
    seatSelectionMode: 'seatSelection',  // Premium → pilih sendiri
  },
  {
    tierId: TIER_IDS.VIP,
    tierName: 'VIP ZONE',
    emoji: '⭐',
    zoneType: 'seated',
    totalRows: 20,
    seatsPerRow: 25,
    rowPrefix: 'P',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'VIP Gate',
    price: 2800000,
    quota: 500,
    sold: 412,
    seatSelectionMode: 'seatSelection',  // Premium → pilih sendiri
  },
  {
    tierId: TIER_IDS.FESTIVAL,
    tierName: 'FESTIVAL',
    emoji: '🎵',
    zoneType: 'standing',
    totalRows: 0,
    seatsPerRow: 0,
    rowPrefix: '',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 15,
    gate: 'Gate A',
    price: 2200000,
    quota: 3000,
    sold: 2150,
    seatSelectionMode: 'seatSelection',  // Standing → pilih zone
  },
  {
    tierId: TIER_IDS.CAT1,
    tierName: 'CAT 1',
    emoji: '🎟️',
    zoneType: 'seated',
    totalRows: 20,
    seatsPerRow: 100,
    rowPrefix: 'A',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'Gate B',
    price: 1750000,
    quota: 2000,
    sold: 1780,
    seatSelectionMode: 'both',  // Mid-tier → pilih sendiri atau auto
  },
  {
    tierId: TIER_IDS.CAT2,
    tierName: 'CAT 2',
    emoji: '🎫',
    zoneType: 'seated',
    totalRows: 30,
    seatsPerRow: 100,
    rowPrefix: 'B',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'Gate B',
    price: 1400000,
    quota: 3000,
    sold: 2410,
    seatSelectionMode: 'both',  // Mid-tier → pilih sendiri atau auto
  },
  {
    tierId: TIER_IDS.CAT3,
    tierName: 'CAT 3',
    emoji: '🎫',
    zoneType: 'seated',
    totalRows: 30,
    seatsPerRow: 100,
    rowPrefix: 'C',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'Gate C',
    price: 1100000,
    quota: 3000,
    sold: 1950,
    seatSelectionMode: 'autoAssign',  // Lower → auto assign
  },
  {
    tierId: TIER_IDS.CAT4,
    tierName: 'CAT 4',
    emoji: '🎟️',
    zoneType: 'seated',
    totalRows: 40,
    seatsPerRow: 100,
    rowPrefix: 'D',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'Gate C',
    price: 850000,
    quota: 4000,
    sold: 2680,
    seatSelectionMode: 'autoAssign',  // Lower → auto assign
  },
  {
    tierId: TIER_IDS.CAT5,
    tierName: 'CAT 5',
    emoji: '🎟️',
    zoneType: 'seated',
    totalRows: 30,
    seatsPerRow: 100,
    rowPrefix: 'E',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'Gate D',
    price: 550000,
    quota: 3000,
    sold: 1520,
    seatSelectionMode: 'autoAssign',  // Lower → auto assign
  },
  {
    tierId: TIER_IDS.CAT6,
    tierName: 'CAT 6',
    emoji: '🎟️',
    zoneType: 'seated',
    totalRows: 30,
    seatsPerRow: 100,
    rowPrefix: 'F',
    rowDelimiter: '',
    seatNumberStart: 1,
    totalZones: 0,
    gate: 'Gate D',
    price: 350000,
    quota: 3000,
    sold: 980,
    seatSelectionMode: 'autoAssign',  // Lower → auto assign
  },
]

// ─── SEAT GENERATION ─────────────────────────────────────────────────────────

function generateRowLabel(prefix: string, rowIndex: number): string {
  if (!prefix) return ''
  // For single letter prefix: A, B, C... Z, AA, AB, AC...
  const base = prefix.charCodeAt(0) - 65
  const letterIndex = base + rowIndex
  if (letterIndex < 26) {
    return String.fromCharCode(65 + letterIndex)
  }
  // Double letter
  const first = String.fromCharCode(65 + Math.floor(letterIndex / 26) - 1)
  const second = String.fromCharCode(65 + (letterIndex % 26))
  return first + second
}

export function generateSeats(config: SeatConfig): Seat[] {
  const seats: Seat[] = []
  const now = new Date().toISOString()

  if (config.zoneType === 'seated') {
    for (let row = 0; row < config.totalRows; row++) {
      const rowLabel = generateRowLabel(config.rowPrefix, row)
      for (let seat = 0; seat < config.seatsPerRow; seat++) {
        const seatNum = config.seatNumberStart + seat
        const seatLabel = config.rowDelimiter
          ? `${rowLabel}${config.rowDelimiter}${seatNum}`
          : `${rowLabel}${seatNum}`

        seats.push({
          // ISeat-compatible fields
          id: uuidv4(),
          tenantId: MOCK_TENANT_ID,
          eventId: MOCK_EVENT_ID,
          ticketTypeId: config.tierId,
          section: config.tierName,
          row: rowLabel,
          number: String(seatNum),
          label: seatLabel,
          status: 'available',
          createdAt: now,
          updatedAt: now,
          // SeatDisplay fields
          tierId: config.tierId,
          tierName: config.tierName,
          // Legacy aliases for backward compatibility
          rowLabel,
          seatNumber: seatNum,
          seatLabel,
        })
      }
    }
  } else if (config.zoneType === 'standing') {
    for (let z = 1; z <= config.totalZones; z++) {
      const zoneLabel = `Zone ${z}`
      seats.push({
        // ISeat-compatible fields
        id: uuidv4(),
        tenantId: MOCK_TENANT_ID,
        eventId: MOCK_EVENT_ID,
        ticketTypeId: config.tierId,
        section: config.tierName,
        row: 'Zone',
        number: String(z),
        label: zoneLabel,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        // SeatDisplay fields
        tierId: config.tierId,
        tierName: config.tierName,
        // Legacy aliases for backward compatibility
        rowLabel: 'Zone',
        seatNumber: z,
        seatLabel: zoneLabel,
      })
    }
  }
  // 'free' type = no seats generated

  return seats
}

// ─── MOCK SOLD SEATS ────────────────────────────────────────────────────────
// Simulate some seats being sold based on config.sold percentage

export function generateMockSeats(config: SeatConfig): Seat[] {
  const seats = generateSeats(config)
  const totalGenerated = seats.length
  if (totalGenerated === 0) return []

  const soldCount = Math.min(config.sold, totalGenerated)
  const soldPercentage = soldCount / totalGenerated

  // Deterministic "random" based on tierId
  let seed = 0
  for (let i = 0; i < config.tierId.length; i++) {
    seed = ((seed << 5) - seed + config.tierId.charCodeAt(i)) | 0
  }

  const now = new Date().toISOString()

  const soldSeats = seats.map((seat, i) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const random = (seed % 1000) / 1000

    let status: SeatStatus = 'available'
    if (random < soldPercentage * 0.92) {
      status = 'sold'
    } else if (random < soldPercentage) {
      status = 'reserved'
    }

    // Also add some locked seats (held by system)
    if (i === 0 || i === 1) status = 'locked'

    return {
      ...seat,
      status,
      updatedAt: now,
      // Legacy orderId for sold seats (UUID format)
      ...(status === 'sold' ? {
        orderId: uuidv4(),
      } : {}),
      // Legacy reservedAt for reserved seats
      ...(status === 'reserved' ? {
        reservedAt: now,
      } : {}),
    }
  })

  return soldSeats
}

// ─── SEAT STATS ──────────────────────────────────────────────────────────────

export function getSeatStats(seats: Seat[]): SeatStats {
  return {
    total: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    reserved: seats.filter(s => s.status === 'reserved').length,
    sold: seats.filter(s => s.status === 'sold').length,
    locked: seats.filter(s => s.status === 'locked').length,
  }
}

// ─── SEAT MAP HELPERS ───────────────────────────────────────────────────────

export function getSeatColor(status: SeatStatus): string {
  switch (status) {
    case 'available': return 'bg-emerald-500/30 hover:bg-emerald-500/50 border-emerald-500/40 text-emerald-300'
    case 'reserved': return 'bg-amber-500/30 border-amber-500/40 text-amber-300'
    case 'sold': return 'bg-red-500/20 border-red-500/30 text-red-400/60'
    case 'locked': return 'bg-gray-500/20 border-gray-500/30 text-gray-500/60'
    default: return 'bg-muted border-border text-muted-foreground'
  }
}

export function getSeatDotColor(status: SeatStatus): string {
  switch (status) {
    case 'available': return 'bg-emerald-500'
    case 'reserved': return 'bg-amber-500'
    case 'sold': return 'bg-red-500'
    case 'locked': return 'bg-gray-500'
    default: return 'bg-muted-foreground'
  }
}

export function getStatusLabel(status: SeatStatus): string {
  switch (status) {
    case 'available': return 'Tersedia'
    case 'reserved': return 'Dipesan'
    case 'sold': return 'Terjual'
    case 'locked': return 'Dikunci'
    default: return status
  }
}

export function getZoneTypeLabel(type: ZoneType): string {
  switch (type) {
    case 'seated': return 'Kursi Bernomor'
    case 'standing': return 'Standing Zone'
    case 'free': return 'General Admission'
    default: return type
  }
}

// ─── AUTO-ASSIGN ALGORITHM ─────────────────────────────────────────────────
// Best available: closest to center, lowest row number

export function autoAssignSeat(seats: Seat[]): Seat | null {
  const available = seats.filter(s => s.status === 'available')
  if (available.length === 0) return null

  // Sort by: row index (asc), then distance from center (asc)
  const sorted = [...available].sort((a, b) => {
    // Same row: prefer center seats
    if (a.rowLabel === b.rowLabel) {
      return Math.abs(a.seatNumber - 50) - Math.abs(b.seatNumber - 50)
    }
    // Lower row = closer to stage
    return a.rowLabel.localeCompare(b.rowLabel)
  })

  return sorted[0]
}

export function getSelectionModeLabel(mode: SeatSelectionMode): string {
  switch (mode) {
    case 'seatSelection': return 'Pilih Kursi'
    case 'autoAssign': return 'Auto Assign'
    case 'both': return 'Pilih / Auto'
    default: return mode
  }
}

// ─── COMPUTED TOTAL FROM CONFIG ─────────────────────────────────────────────

export function getComputedTotal(config: SeatConfig): number {
  if (config.zoneType === 'seated') {
    return config.totalRows * config.seatsPerRow
  } else if (config.zoneType === 'standing') {
    return config.totalZones
  }
  return config.quota // 'free' uses quota as-is
}
