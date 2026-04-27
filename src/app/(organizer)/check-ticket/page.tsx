'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Ticket,
  User,
  Tag,
  Watch,
  MapPin,
  DollarSign,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockTickets } from '@/lib/admin-mock-data'
import { wristbandConfigs } from '@/lib/operational-mock-data'
import { formatRupiah } from '@/lib/mock-data'

function getStatusInfo(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Aktif', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' }
    case 'redeemed':
      return { label: 'Diredeem', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' }
    case 'inside':
      return { label: 'Di Dalam Venue', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' }
    case 'cancelled':
      return { label: 'Dibatalkan', color: 'bg-red-500/15 text-red-400 border-red-500/20' }
    default:
      return { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' }
  }
}

export default function CheckTicketPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return mockTickets
      .filter(
        (t) =>
          t.ticketCode.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q)
      )
      .slice(0, 10)
  }, [searchQuery])

  const handleSelect = (ticket: typeof mockTickets[0]) => {
    setSelectedTicket(ticket)
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Cek Tiket</h1>
        <p className="text-[#7FB3AE] mt-1">Cari data tiket dan peserta berdasarkan kode atau nama</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#111918] border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-[#00A39D]" />
                Pencarian Tiket
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7FB3AE]" />
                <Input
                  placeholder="Masukkan kode tiket atau nama peserta..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (selectedTicket) setSelectedTicket(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      handleSelect(searchResults[0])
                    }
                  }}
                  className="pl-10 bg-[#0A0F0E] border-white/10 text-white placeholder:text-[#7FB3AE]/50"
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim() && searchResults.length > 0 && !selectedTicket && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-[#7FB3AE] px-1">{searchResults.length} hasil ditemukan</p>
                  {searchResults.map((ticket) => {
                    const statusInfo = getStatusInfo(ticket.status)
                    return (
                      <button
                        key={ticket.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E] border border-white/5 hover:border-[#00A39D]/20 text-left transition-colors"
                        onClick={() => handleSelect(ticket)}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#00A39D]/10 flex items-center justify-center shrink-0">
                          <Ticket className="h-4 w-4 text-[#00A39D]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{ticket.userName}</p>
                          <p className="text-[11px] text-[#7FB3AE] font-mono">{ticket.ticketCode}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="outline" className={cn('text-[10px]', statusInfo.color)}>
                            {statusInfo.label}
                          </Badge>
                          <p className="text-[10px] text-[#7FB3AE] mt-1">{ticket.ticketType}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {searchQuery.trim() && searchResults.length === 0 && !selectedTicket && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="h-10 w-10 text-[#7FB3AE]/30 mb-2" />
                  <p className="text-sm text-[#7FB3AE]">Tiket tidak ditemukan</p>
                  <p className="text-xs text-[#7FB3AE]/60 mt-1">Coba kata kunci lain atau periksa kode tiket</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Ticket Detail */}
          {selectedTicket && (
            <Card className="bg-[#111918] border-[#00A39D]/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base">Detail Tiket</CardTitle>
                  {(() => {
                    const s = getStatusInfo(selectedTicket.status)
                    return <Badge variant="outline" className={cn('text-xs', s.color)}>{s.label}</Badge>
                  })()}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <Ticket className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#7FB3AE]">Kode Tiket</p>
                      <p className="font-mono font-semibold text-sm text-white">{selectedTicket.ticketCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <User className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#7FB3AE]">Nama Peserta</p>
                      <p className="font-semibold text-sm text-white">{selectedTicket.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <Tag className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#7FB3AE]">Tipe Tiket</p>
                      <p className="font-semibold text-sm text-white">{selectedTicket.ticketType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <DollarSign className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#7FB3AE]">Harga</p>
                      <p className="font-semibold text-sm text-white">{formatRupiah(selectedTicket.tier === 'floor' ? 2800000 : 1100000)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <Watch className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#7FB3AE]">Kode Gelang</p>
                      <p className="font-mono font-semibold text-sm text-white">{selectedTicket.wristbandCode || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]">
                    <MapPin className="h-5 w-5 text-[#00A39D] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#7FB3AE]">Zona</p>
                      <p className="font-semibold text-sm text-white capitalize">{selectedTicket.tier}</p>
                    </div>
                  </div>
                </div>

                {/* Wristband info */}
                {selectedTicket.wristbandLinked && (() => {
                  const wbConfig = wristbandConfigs.find(w => w.ticketTypeName === selectedTicket.ticketType)
                  return (
                    <div className="p-3 rounded-lg bg-[#00A39D]/5 border border-[#00A39D]/15 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 border-2 border-white/10"
                        style={{ backgroundColor: wbConfig?.wristbandColorHex || '#555' }}
                      />
                      <div>
                        <p className="text-xs text-white font-medium">
                          Gelang {wbConfig?.wristbandColor || '—'} ({wbConfig?.wristbandType || '—'})
                        </p>
                        <p className="text-[11px] text-[#7FB3AE]">
                          {selectedTicket.redeemedAt
                            ? `Ditukar pada ${new Date(selectedTicket.redeemedAt).toLocaleString('id-ID')}`
                            : 'Terhubung'}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                <button
                  className="w-full text-center text-sm text-[#7FB3AE] hover:text-white transition-colors py-2"
                  onClick={() => setSelectedTicket(null)}
                >
                  ← Kembali ke pencarian
                </button>
              </CardContent>
            </Card>
          )}

          {/* Empty state when no search */}
          {!selectedTicket && !searchQuery.trim() && (
            <Card className="bg-[#111918] border border-dashed border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-[#7FB3AE]/20 mb-3" />
                <p className="text-[#7FB3AE] text-sm">Masukkan kode tiket atau nama peserta</p>
                <p className="text-[#7FB3AE]/50 text-xs mt-1">Contoh: SHL-JKT-VIPZON-0001</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Quick Stats */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[#7FB3AE] uppercase tracking-wider">Ringkasan</h3>
          <Card className="bg-[#111918] border-white/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00A39D]/10">
                  <Ticket className="h-4 w-4 text-[#00A39D]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7FB3AE]">Total Tiket</p>
                  <p className="text-lg font-bold text-white">{mockTickets.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7FB3AE]">Aktif</p>
                  <p className="text-lg font-bold text-emerald-400">{mockTickets.filter(t => t.status === 'active').length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Watch className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7FB3AE]">Diredeem</p>
                  <p className="text-lg font-bold text-amber-400">{mockTickets.filter(t => t.status === 'redeemed').length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MapPin className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-[#7FB3AE]">Di Dalam Venue</p>
                  <p className="text-lg font-bold text-blue-400">{mockTickets.filter(t => t.status === 'inside').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
