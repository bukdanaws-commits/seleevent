'use client'

import { useState, useMemo } from 'react'
import {
  ScanLine,
  Camera,
  Keyboard,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Ticket,
  MapPin,
  CircleDollarSign,
  Watch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  mockStaffUsers,
  mockCounters,
  mockRedemptions,
  wristbandConfigs,
} from '@/lib/operational-mock-data'
import { formatRupiah } from '@/lib/mock-data'

// ============================================================
// Types
// ============================================================

interface TicketResult {
  ticketCode: string
  attendeeName: string
  ticketType: string
  emoji: string
  seatLabel: string | null
  price: number
  wristbandColor: string
  wristbandColorHex: string
  wristbandType: string
  wristbandCode: string
}

// ============================================================
// Mock ticket lookup data
// ============================================================

const mockTicketLookup: Record<string, TicketResult> = (() => {
  const names = [
    'Budi Santoso',
    'Sari Dewi',
    'Ahmad Hidayat',
    'Fitri Handayani',
    'Rudi Hartono',
    'Yuliana Putri',
    'Dimas Arya',
    'Ani Rahayu',
  ]
  const results: Record<string, TicketResult> = {}

  names.forEach((name, i) => {
    const wb = wristbandConfigs[i % wristbandConfigs.length]
    const code = `SHL-JKT-${wb.ticketTypeName.replace(/\s/g, '').toUpperCase().slice(0, 6)}-${String(i + 1).padStart(4, '0')}`
    const seatIdx = i < 4 ? i : null
    const seatLabels: Record<string, string[]> = {
      VVIPIP: ['V1', 'V2', 'V5', 'V8'],
      VIPZONE: ['P1', 'P5', 'P10', 'P12'],
      FESTIVA: null as unknown as string[],
      CAT1: ['A1', 'A5', 'A10', 'A15'],
      CAT2: ['B1', 'B10', 'C3', 'C12'],
      CAT3: ['C1', 'C10', 'D5', 'D20'],
      CAT4: ['D1', 'D15', 'E5', 'E25'],
      CAT5: ['E1', 'E10', 'F5', 'F20'],
    }
    const key = wb.ticketTypeName.replace(/\s/g, '').toUpperCase().slice(0, 6)
    const seats = seatLabels[key]
    results[code] = {
      ticketCode: code,
      attendeeName: name,
      ticketType: wb.ticketTypeName,
      emoji: wb.emoji,
      seatLabel: seats && seatIdx !== null ? seats[seatIdx % seats.length] : null,
      price: [3500000, 2800000, 2200000, 1750000, 1400000, 1100000, 850000, 550000][i % 8],
      wristbandColor: wb.wristbandColor,
      wristbandColorHex: wb.wristbandColorHex,
      wristbandType: wb.wristbandType,
      wristbandCode: `WB-${String(i + 1).padStart(5, '0')}`,
    }
  })

  return results
})()

// ============================================================
// Component
// ============================================================

export function CounterScanner() {
  const [ticketCode, setTicketCode] = useState('')
  const [result, setResult] = useState<TicketResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const currentStaff = mockStaffUsers.find((s) => s.id === 'cs-001')!
  const currentCounter = mockCounters.find((c) => c.id === 'ctr-001')!
  const todayRedemptions = mockRedemptions.filter(
    (r) =>
      r.counterName === currentCounter.name &&
      r.staffName === currentStaff.name
  )

  const handleLookup = () => {
    if (!ticketCode.trim()) return

    setScanning(true)
    setNotFound(false)
    setResult(null)

    // Simulate scan delay
    setTimeout(() => {
      const found = mockTicketLookup[ticketCode.trim().toUpperCase()]
      if (found) {
        setResult(found)
        setNotFound(false)
      } else {
        setNotFound(true)
        toast.error('Tiket tidak ditemukan', {
          description: `Kode "${ticketCode}" tidak terdaftar dalam sistem.`,
        })
      }
      setScanning(false)
    }, 600)
  }

  const handleRedeem = () => {
    if (!result) return

    toast.success('Gelang berhasil ditukar!', {
      description: `${result.attendeeName} — ${result.wristbandCode} (${result.wristbandColor})`,
    })

    setResult(null)
    setTicketCode('')
    setNotFound(false)
  }

  const handleReject = () => {
    if (!result) return

    toast.warning('Tiket ditolak', {
      description: `Penukaran untuk ${result.attendeeName} dibatalkan.`,
    })

    setResult(null)
    setTicketCode('')
    setNotFound(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLookup()
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      {/* ── Today's Quick Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-[#111918] border-border/30">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Dituksr Hari Ini
            </p>
            <p className="text-xl font-bold text-primary mt-1">
              {todayRedemptions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#111918] border-border/30">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Counter
            </p>
            <p className="text-xl font-bold text-foreground mt-1">{currentCounter.name}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111918] border-border/30">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Status
            </p>
            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] mt-1.5 hover:bg-emerald-500/20">
              ● Aktif
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ── Scan Viewfinder (Simulated) ── */}
      <Card className="bg-[#111918] border-border/30 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Camera className="h-4 w-4 text-primary" />
            Pindai Kode QR Tiket
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Simulated camera viewfinder */}
          <div className="relative w-full aspect-[4/3] max-w-sm bg-black/60 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-primary rounded-br-lg" />

            {/* Crosshair */}
            <div className="flex flex-col items-center gap-2 text-primary/50">
              <ScanLine className="h-8 w-8 animate-pulse" />
              <p className="text-xs font-medium">
                {scanning ? 'Memindai...' : 'Arahkan QR ke area ini'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Scanner kamera dalam mode demo
              </p>
            </div>

            {/* Scan line animation */}
            {scanning && (
              <div className="absolute inset-x-4 top-0 h-0.5 bg-primary animate-[scanLine_1.5s_ease-in-out_infinite]" />
            )}
          </div>

          {/* Manual Input */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Atau input kode tiket secara manual:
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Contoh: SHL-JKT-VVIPIP-0001"
                className="font-mono text-sm bg-[#0A0F0E] border-border/50 focus:border-primary"
                disabled={scanning}
              />
              <Button
                onClick={handleLookup}
                disabled={!ticketCode.trim() || scanning}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                {scanning ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Coba: SHL-JKT-VVIPIP-0001, SHL-JKT-VIPZONE-0002, SHL-JKT-FESTIVA-0003
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Result Panel ── */}
      {result && (
        <Card className="bg-[#111918] border-primary/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Tiket Ditemukan
              </CardTitle>
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-border/50"
              >
                {result.ticketCode}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Attendee Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-lg">
                    {result.emoji}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {result.attendeeName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.ticketType}
                  </p>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Tipe Tiket</p>
                    <p className="text-xs font-medium text-foreground">
                      {result.emoji} {result.ticketType}
                    </p>
                  </div>
                </div>
                {result.seatLabel && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Kursi</p>
                      <p className="text-xs font-medium text-foreground">
                        {result.seatLabel}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Harga</p>
                    <p className="text-xs font-medium text-amber-400">
                      {formatRupiah(result.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Watch className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Kode Gelang</p>
                    <p className="text-xs font-medium text-foreground font-mono">
                      {result.wristbandCode}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Wristband Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/30">
                <div
                  className="h-8 w-8 rounded-full shrink-0 border-2 border-white/20"
                  style={{ backgroundColor: result.wristbandColorHex }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    Gelang {result.wristbandColor}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {result.wristbandType}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleRedeem}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                TUKAR & PASANG GELANG
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="h-11 px-5"
              >
                <XCircle className="h-4 w-4 mr-1" />
                TOLAK
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Not Found State ── */}
      {notFound && !result && (
        <Card className="bg-[#111918] border-destructive/30 animate-in fade-in duration-200">
          <CardContent className="py-6 flex flex-col items-center gap-3 text-center">
            <XCircle className="h-12 w-12 text-destructive/60" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Tiket Tidak Ditemukan
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Kode tiket &quot;{ticketCode}&quot; tidak terdaftar dalam sistem.
                Pastikan kode yang dimasukkan benar.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNotFound(false)
                setTicketCode('')
              }}
              className="mt-1"
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
