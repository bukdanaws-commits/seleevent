'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  QrCode,
  Search,
  Ticket,
  User,
  Tag,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  ArrowRight,
} from 'lucide-react'
import { mockTickets, wristbandStats } from '@/lib/admin-mock-data'
import type { TicketRecord } from '@/lib/admin-mock-data'
import { wristbandConfigs } from '@/lib/operational-mock-data'

function generateWristbandCode(): string {
  return `WB-${String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0')}`
}

function getStatusBadge(status: TicketRecord['status']) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Aktif</Badge>
    case 'redeemed':
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">Diredeem</Badge>
    case 'inside':
      return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Di Dalam Venue</Badge>
    case 'cancelled':
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20">Dibatalkan</Badge>
    default:
      return <Badge className="bg-gray-500/15 text-gray-400 border-gray-500/20">{status}</Badge>
  }
}

export function RedeemPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [foundTicket, setFoundTicket] = useState<TicketRecord | null>(null)
  const [wristbandInput, setWristbandInput] = useState('')
  const [redeemedTickets, setRedeemedTickets] = useState<Set<string>>(new Set())

  const todayStats = useMemo(() => {
    const redeemed = mockTickets.filter(
      (t) => t.status === 'redeemed' || t.status === 'inside'
    )
    return {
      totalRedeemed: redeemed.length,
      wristbandsRemaining: wristbandStats.unused,
      floorRedeemed: redeemed.filter((t) => t.tier === 'floor').length,
      tribunRedeemed: redeemed.filter((t) => t.tier === 'tribun').length,
    }
  }, [])

  const handleSearch = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      toast.error('Masukkan kode tiket terlebih dahulu')
      return
    }
    const ticket = mockTickets.find(
      (t) => t.ticketCode.toLowerCase() === trimmed.toLowerCase()
    )
    if (!ticket) {
      setFoundTicket(null)
      toast.error('Tiket tidak ditemukan')
      return
    }
    setFoundTicket(ticket)
    const wb = generateWristbandCode()
    setWristbandInput(wb)
  }

  const handleRedeem = () => {
    if (!foundTicket) return
    if (foundTicket.status === 'redeemed' || foundTicket.status === 'inside') {
      toast.error('Tiket ini sudah diredeem sebelumnya')
      return
    }
    if (foundTicket.status === 'cancelled') {
      toast.error('Tiket ini sudah dibatalkan')
      return
    }
    setRedeemedTickets((prev) => new Set(prev).add(foundTicket.ticketCode))
    toast.success('Gelang berhasil ditukarkan!', {
      description: `${foundTicket.ticketCode} → ${wristbandInput}`,
    })
    setFoundTicket({
      ...foundTicket,
      status: 'redeemed',
      wristbandCode: wristbandInput,
      wristbandLinked: true,
      redeemedBy: 'andi.redeem@event.id',
      redeemedAt: new Date().toISOString(),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Penukaran Gelang</h1>
        <p className="text-[#7FB3AE] mt-1">
          Stasiun Penukaran — Scan atau masukkan kode tiket secara manual
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Scanner + Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scanner Section */}
          <Card className="overflow-hidden bg-[#111918] border-white/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <QrCode className="h-5 w-5 text-[#00A39D]" />
                Scanner QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock QR Scan Area */}
              <div className="relative flex items-center justify-center h-48 md:h-64 rounded-lg border-2 border-dashed border-[#00A39D]/30 bg-[#00A39D]/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-[#00A39D]/40 rounded-xl flex items-center justify-center">
                    <div className="w-24 h-24 border-2 border-[#00A39D]/20 rounded-lg flex items-center justify-center">
                      <QrCode className="h-10 w-10 text-[#00A39D]/30" />
                    </div>
                  </div>
                </div>
                <p className="absolute bottom-3 text-sm text-[#00A39D]/70 font-medium">
                  Arahkan QR Code ke scanner
                </p>
              </div>

              <Separator className="bg-white/5" />

              {/* Manual Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7FB3AE]" />
                  <Input
                    placeholder="Masukkan kode tiket (cth: SHL-JKT-VIPZON-0001)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 bg-[#0A0F0E] border-white/10 text-white placeholder:text-[#7FB3AE]/50"
                  />
                </div>
                <Button onClick={handleSearch} className="gap-2 min-w-[100px] bg-[#00A39D] hover:bg-[#00A39D]/90 text-white">
                  <Search className="h-4 w-4" />
                  Cari
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Info Card */}
          {foundTicket && (
            <Card className="bg-[#111918] border-[#00A39D]/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-white">Detail Tiket</h3>
                  {getStatusBadge(foundTicket.status)}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <Ticket className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-xs text-[#7FB3AE]">Kode Tiket</p>
                      <p className="font-mono font-semibold text-sm text-white">{foundTicket.ticketCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <User className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-xs text-[#7FB3AE]">Nama Peserta</p>
                      <p className="font-semibold text-sm text-white">{foundTicket.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <Tag className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-xs text-[#7FB3AE]">Tipe Tiket</p>
                      <p className="font-semibold text-sm text-white">{foundTicket.ticketType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <MapPin className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-xs text-[#7FB3AE]">Zona</p>
                      <p className="font-semibold text-sm text-white capitalize">{foundTicket.tier}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Already redeemed warning */}
                {(foundTicket.status === 'redeemed' || foundTicket.status === 'inside') && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-400">Sudah Diredeem</p>
                      <p className="text-sm text-red-300/80">
                        Tiket ini sudah ditukarkan dengan gelang{' '}
                        <span className="font-mono font-semibold">{foundTicket.wristbandCode}</span>
                        {foundTicket.redeemedAt && (
                          <span>
                            {' '}pada{' '}
                            {new Date(foundTicket.redeemedAt).toLocaleTimeString('id-ID')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Active ticket: wristband pairing */}
                {foundTicket.status === 'active' && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-white">
                      <CircleDot className="h-4 w-4 text-[#00A39D]" />
                      Pasangkan Gelang
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        value={wristbandInput}
                        onChange={(e) => setWristbandInput(e.target.value)}
                        placeholder="Scan kode gelang..."
                        className="font-mono bg-[#0A0F0E] border-white/10 text-white placeholder:text-[#7FB3AE]/50"
                      />
                      <Button onClick={handleRedeem} className="gap-2 bg-[#00A39D] hover:bg-[#00A39D]/90 text-white min-w-[140px]">
                        <CheckCircle2 className="h-4 w-4" />
                        Tukar Gelang
                      </Button>
                    </div>
                    <p className="text-xs text-[#7FB3AE]">
                      Scan barcode gelang atau masukkan kode secara manual
                    </p>
                  </div>
                )}

                {/* Cancelled */}
                {foundTicket.status === 'cancelled' && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-400">Tiket Dibatalkan</p>
                      <p className="text-sm text-red-300/80">
                        Tiket ini sudah dibatalkan dan tidak dapat ditukarkan
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!foundTicket && (
            <Card className="bg-[#111918] border-dashed border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Ticket className="h-12 w-12 text-[#7FB3AE]/20 mb-3" />
                <p className="text-[#7FB3AE] text-sm">
                  Scan QR code atau masukkan kode tiket untuk melihat detail
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Today's Stats */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xs text-[#7FB3AE] uppercase tracking-wider">
            Statistik Hari Ini
          </h3>

          <Card className="bg-gradient-to-br from-[#00A39D] to-[#00A39D]/70 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Total Diredeem</p>
                  <p className="text-2xl font-bold">{todayStats.totalRedeemed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/15">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <CircleDot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-amber-300/70">Sisa Gelang</p>
                  <p className="text-2xl font-bold">{todayStats.wristbandsRemaining.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111918] border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00A39D]/10">
                  <MapPin className="h-5 w-5 text-[#00A39D]" />
                </div>
                <div>
                  <p className="text-xs text-[#7FB3AE]">Floor Zone Diredeem</p>
                  <p className="text-2xl font-bold text-white">{todayStats.floorRedeemed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111918] border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00A39D]/10">
                  <ArrowRight className="h-5 w-5 text-[#00A39D]" />
                </div>
                <div>
                  <p className="text-xs text-[#7FB3AE]">Tribun Zone Diredeem</p>
                  <p className="text-2xl font-bold text-white">{todayStats.tribunRedeemed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
