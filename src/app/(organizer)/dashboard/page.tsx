'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  CheckCircle2,
  LogIn,
  Ticket,
  Store,
  DoorOpen,
  TrendingUp,
  Zap,
  DollarSign,
  ArrowRight,
  Shield,
  Activity,
  Search,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  liveStats,
  mockRedemptions,
  mockGates,
  mockCounters,
  wristbandConfigs,
} from '@/lib/operational-mock-data'
import { formatRupiah } from '@/lib/mock-data'
import { mockTickets, salesByTier } from '@/lib/admin-mock-data'

export default function DashboardPage() {
  const totalTicketsSold = mockTickets.length
  const totalRedeemed = mockTickets.filter(t => t.status === 'redeemed' || t.status === 'inside').length
  const totalInside = mockTickets.filter(t => t.status === 'inside').length
  const activeCounters = mockCounters.filter(c => c.status === 'active').length
  const activeGates = mockGates.filter(g => g.status === 'active').length
  const occupancyRate = totalTicketsSold > 0 ? Math.round((totalInside / totalTicketsSold) * 100) : 0
  const avgSpeed = activeGates > 0 ? Math.round(liveStats.totalGateScans / activeGates / 120) : 0
  const totalRevenue = salesByTier.reduce((sum, s) => sum + s.revenue, 0)

  const recentRedemptions = mockRedemptions.slice(0, 5)

  const primaryKpis = [
    { label: 'Total Peserta', value: totalTicketsSold, icon: Users, color: 'text-white', bg: 'bg-gradient-to-br from-[#00A39D] to-[#00A39D]/70' },
    { label: 'Sudah Redeem', value: totalRedeemed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20' },
    { label: 'Di Dalam Venue', value: totalInside, icon: LogIn, color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20' },
    { label: 'Tiket Terjual', value: totalTicketsSold, icon: Ticket, color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20' },
  ]

  const secondaryStats = [
    { label: 'Counter Aktif', value: activeCounters, icon: Store, color: 'text-[#00A39D]' },
    { label: 'Gate Aktif', value: activeGates, icon: DoorOpen, color: 'text-[#00A39D]' },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-[#00A39D]' },
    { label: 'Avg Speed', value: `${avgSpeed}/min`, icon: Zap, color: 'text-[#00A39D]' },
  ]

  const quickActions = [
    { title: 'Penukaran Gelang', href: '/organizer/redeem', icon: Shield, desc: 'Tukar tiket jadi gelang' },
    { title: 'Live Monitor', href: '/organizer/live-monitor', icon: Activity, desc: 'Monitor real-time venue' },
    { title: 'Cek Tiket', href: '/organizer/check-ticket', icon: Search, desc: 'Cari data peserta' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-[#7FB3AE] mt-1">Ringkasan operasional hari ini — 24 Mei 2025</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {primaryKpis.map((kpi) => (
          <Card key={kpi.label} className={cn('py-4 border-0', kpi.bg)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-white/60">{kpi.label}</p>
                  <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats + Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {secondaryStats.map((stat) => (
          <Card key={stat.label} className="bg-[#111918] border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00A39D]/10">
                <stat.icon className="h-4 w-4 text-[#00A39D]" />
              </div>
              <div>
                <p className="text-[11px] text-[#7FB3AE]">{stat.label}</p>
                <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Summary */}
      <Card className="bg-[#111918] border-white/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-[#7FB3AE]">Total Pendapatan</p>
              <p className="text-xl font-bold text-amber-400">{formatRupiah(totalRevenue)}</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs">
            {totalTicketsSold} tiket terjual
          </Badge>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-[#7FB3AE] uppercase tracking-wider mb-3">Aksi Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="bg-[#111918] border-white/5 hover:border-[#00A39D]/30 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#00A39D]/10 group-hover:bg-[#00A39D]/20 transition-colors">
                    <action.icon className="h-5 w-5 text-[#00A39D]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{action.title}</p>
                    <p className="text-xs text-[#7FB3AE]">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#7FB3AE] group-hover:text-[#00A39D] transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-[#111918] border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00A39D]" />
            Aktivitas Penukaran Terkini
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {recentRedemptions.map((r) => {
              const wbConfig = wristbandConfigs.find(w => w.ticketTypeName === r.ticketType)
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E]/60 border border-white/5">
                  <div
                    className="w-9 h-9 rounded-full shrink-0 border-2 border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: wbConfig?.wristbandColorHex || '#555' }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-medium truncate">{r.attendeeName}</p>
                      <Badge className="text-[9px] px-1.5 py-0 bg-[#00A39D]/15 text-[#00A39D] border-[#00A39D]/20">
                        {r.ticketType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#7FB3AE] mt-0.5">
                      <span className="font-mono">{r.wristbandCode}</span>
                      <span>•</span>
                      <span>{r.counterName}</span>
                      <span>•</span>
                      <span>{r.staffName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-[#7FB3AE]">{new Date(r.redeemedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs font-semibold text-white">{formatRupiah(r.price)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
