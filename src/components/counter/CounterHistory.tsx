'use client'

import { useState, useMemo } from 'react'
import {
  Clock,
  Search,
  User,
  Ticket,
  Watch,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  mockStaffUsers,
  mockCounters,
  mockRedemptions,
  wristbandConfigs,
  formatTime,
  formatDateTimeShort,
} from '@/lib/operational-mock-data'

// ============================================================
// Helpers
// ============================================================

function getWristbandColorHex(color: string): string {
  const found = wristbandConfigs.find((w) => w.wristbandColor === color)
  return found?.wristbandColorHex || '#E5E7EB'
}

// ============================================================
// Component
// ============================================================

export function CounterHistory() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)

  const currentStaff = mockStaffUsers.find((s) => s.id === 'cs-001')!
  const currentCounter = mockCounters.find((c) => c.id === 'ctr-001')!

  // Filter redemptions for this counter + staff
  const myRedemptions = useMemo(() => {
    return mockRedemptions.filter(
      (r) =>
        r.counterName === currentCounter.name &&
        r.staffName === currentStaff.name
    )
  }, [])

  // Apply search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return myRedemptions
    const q = search.toLowerCase()
    return myRedemptions.filter(
      (r) =>
        r.attendeeName.toLowerCase().includes(q) ||
        r.ticketCode.toLowerCase().includes(q) ||
        r.wristbandCode.toLowerCase().includes(q) ||
        r.ticketType.toLowerCase().includes(q)
    )
  }, [myRedemptions, search])

  // Show limited items when collapsed
  const displayed = expanded ? filtered : filtered.slice(0, 10)
  const hasMore = filtered.length > 10

  // Get today's date string for filtering
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayRedemptions = myRedemptions.filter((r) =>
    r.redeemedAt.startsWith('2025-05-24')
  )

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      {/* ── Summary Card ── */}
      <Card className="bg-[#111918] border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" />
            Ringkasan Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <p className="text-2xl font-bold text-primary">
                {todayRedemptions.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Total Dituksr
              </p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <p className="text-2xl font-bold text-amber-400">
                {myRedemptions.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Total Saya (Semua)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, kode tiket, atau gelang..."
          className="pl-9 bg-[#111918] border-border/30 text-sm focus:border-primary"
        />
      </div>

      {/* ── Filter info ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} penukaran ditemukan
        </p>
        {search && (
          <Badge
            variant="outline"
            className="text-[10px] text-primary border-primary/30"
          >
            {currentCounter.name} — {currentStaff.name}
          </Badge>
        )}
      </div>

      {/* ── Redemption List ── */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="bg-[#111918] border-border/30">
            <CardContent className="py-8 flex flex-col items-center gap-2 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                Tidak ada data penukaran
              </p>
              <p className="text-xs text-muted-foreground/70">
                {search
                  ? 'Coba ubah kata kunci pencarian'
                  : 'Belum ada penukaran gelang hari ini'}
              </p>
            </CardContent>
          </Card>
        ) : (
          displayed.map((r, idx) => (
            <Card
              key={r.id}
              className="bg-[#111918] border-border/30 hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Sequence number */}
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Row 1: Name + Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {r.attendeeName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatTime(r.redeemedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Ticket type + wristband */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-border/50"
                        >
                          {r.ticketType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Watch className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {r.wristbandCode}
                        </span>
                      </div>
                      {/* Wristband color dot */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-3.5 w-3.5 rounded-full border border-white/10"
                          style={{
                            backgroundColor: getWristbandColorHex(r.wristbandColor),
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {r.wristbandColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Expand/Collapse ── */}
      {hasMore && (
        <Button
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className="w-full border-border/30 hover:border-primary/30"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Sembunyikan ({filtered.length - 10} lainnya)
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Lihat Semua ({filtered.length})
            </>
          )}
        </Button>
      )}
    </div>
  )
}
