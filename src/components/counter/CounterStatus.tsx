'use client'

import {
  MapPin,
  Users,
  Gauge,
  Clock,
  Calendar,
  Shield,
  TrendingUp,
  Activity,
  Timer,
  Building2,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  mockStaffUsers,
  mockCounters,
  mockRedemptions,
  mockRedemptionConfig,
  getCounterStatusBadge,
  getStatusBadgeColor,
} from '@/lib/operational-mock-data'

// ============================================================
// Component
// ============================================================

export function CounterStatus() {
  const currentStaff = mockStaffUsers.find((s) => s.id === 'cs-001')!
  const currentCounter = mockCounters.find((c) => c.id === 'ctr-001')!
  const config = mockRedemptionConfig

  // Calculate stats
  const allCounterRedemptions = mockRedemptions.filter(
    (r) => r.counterName === currentCounter.name
  )
  const myRedemptions = mockRedemptions.filter(
    (r) =>
      r.counterName === currentCounter.name &&
      r.staffName === currentStaff.name
  )

  // Staff on duty at this counter
  const staffOnDuty = mockStaffUsers.filter(
    (s) =>
      s.role === 'COUNTER_STAFF' &&
      s.status === 'active' &&
      s.assignedLocation === currentCounter.name
  )

  // Average per hour (assuming ~8 hour shift, use total counter redemptions)
  const avgPerHour = Math.round(
    allCounterRedemptions.length /
      Math.max(1, Math.ceil((Date.now() - new Date(currentCounter.openAt || config.startDate + 'T08:00:00').getTime()) / (1000 * 60 * 60)))
  ).toFixed(1)

  // Counter capacity usage
  const capacityPercent = Math.round(
    (allCounterRedemptions.length / currentCounter.capacity) * 100
  )

  const counterStatus = getCounterStatusBadge(currentCounter.status)

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      {/* ── Counter Info Card ── */}
      <Card className="bg-[#111918] border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4 text-primary" />
              Informasi Counter
            </CardTitle>
            <Badge className={cn('text-[10px] hover:bg-opacity-80', counterStatus.color)}>
              {counterStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">
                {currentCounter.name.split(' ')[1]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground">
                {currentCounter.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {currentCounter.location}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/30" />

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-2.5 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <Users className="h-4 w-4 text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">
                {currentCounter.staffCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Staff</p>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <Gauge className="h-4 w-4 text-amber-400 mb-1" />
              <p className="text-lg font-bold text-foreground">
                {currentCounter.capacity}
              </p>
              <p className="text-[10px] text-muted-foreground">Kapasitas</p>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <Activity className="h-4 w-4 text-emerald-400 mb-1" />
              <p className="text-lg font-bold text-foreground">
                {currentCounter.redeemedToday}
              </p>
              <p className="text-[10px] text-muted-foreground">Dituksr</p>
            </div>
          </div>

          {/* Capacity Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Kapasitas Terpakai
              </span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  capacityPercent >= 80
                    ? 'text-red-400'
                    : capacityPercent >= 60
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                )}
              >
                {capacityPercent}%
              </span>
            </div>
            <Progress
              value={capacityPercent}
              className={cn(
                'h-2',
                capacityPercent >= 80
                  ? '[&>div]:bg-red-500'
                  : capacityPercent >= 60
                    ? '[&>div]:bg-amber-500'
                    : '[&>div]:bg-emerald-500'
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Staff On Duty ── */}
      <Card className="bg-[#111918] border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" />
            Staff Bertugas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staffOnDuty.map((staff) => (
              <div
                key={staff.id}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg border transition-colors',
                  staff.id === currentStaff.id
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-[#0A0F0E]/50 border-border/20'
                )}
              >
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {initials(staff.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {staff.name}
                    </span>
                    {staff.id === currentStaff.id && (
                      <Badge className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary hover:bg-primary/20">
                        Anda
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {staff.shift === 'pagi' ? 'Pagi' : 'Malam'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {staff.totalScans} scan
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Today's Stats ── */}
      <Card className="bg-[#111918] border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Statistik Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  Saya Dituksr
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {myRedemptions.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] text-muted-foreground">
                  Counter Dituksr
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-400">
                {allCounterRedemptions.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] text-muted-foreground">
                  Rata-rata per Jam (Counter)
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {avgPerHour}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  tiket/jam
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Redemption Period Config ── */}
      <Card className="bg-[#111918] border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Periode Penukaran Gelang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Mulai Tanggal
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                17 Mei 2025
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Sampai Tanggal
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                24 Mei 2025
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Jam Operasional
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {config.startTime} — {config.endTime} WIB
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0F0E]/80 border border-border/20">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Status Periode
                </span>
              </div>
              <Badge
                className={cn(
                  'text-[10px] hover:bg-opacity-80',
                  config.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : config.status === 'upcoming'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                )}
              >
                {config.status === 'active'
                  ? '● Sedang Berlangsung'
                  : config.status === 'upcoming'
                    ? 'Belum Mulai'
                    : 'Sudah Selesai'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


