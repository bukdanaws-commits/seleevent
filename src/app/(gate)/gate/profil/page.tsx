'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Shield,
  MapPin,
  QrCode,
  Gauge,
  Phone,
  Headphones,
  Terminal,
  LogOut,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  mockStaffUsers,
  mockGates,
  mockGateLogs,
  getGateTypeBadge,
} from '@/lib/operational-mock-data'

// Current context
const currentStaff = mockStaffUsers.find(s => s.id === 'gs-001')!
const currentGate = mockGates.find(g => g.id === 'gate-a')!
const gateTypeBadge = getGateTypeBadge(currentGate.type)

// Calculate session stats
const gateLogs = mockGateLogs.filter(l => l.gateName === 'Gate A')
const totalScansToday = gateLogs.length
const hoursActive = new Set(gateLogs.map(l => new Date(l.timestamp).getHours())).size || 1
const avgPerHour = (totalScansToday / hoursActive).toFixed(1)

const initials = currentStaff.name
  .split(' ')
  .map(n => n[0])
  .join('')

export default function GateProfilPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-4">
          {/* ── PAGE TITLE ────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#00A39D]" />
            <h2 className="text-base font-bold">Profil</h2>
          </div>

          {/* ── PROFILE HEADER CARD ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="bg-[#111918] border-white/5">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#00A39D]/20 text-[#00A39D] text-2xl font-bold mb-3 ring-2 ring-[#00A39D]/30 ring-offset-2 ring-offset-[#111918]">
                    {initials}
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-lg font-bold">{currentStaff.name}</h3>
                  <p className="text-sm text-[#7FB3AE] mt-0.5">Gate Staff</p>

                  {/* Shift info */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#00A39D]/15 text-[#00A39D] border border-[#00A39D]/20">
                      Shift {currentStaff.shift ? currentStaff.shift.charAt(0).toUpperCase() + currentStaff.shift.slice(1) : '-'}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Aktif
                    </span>
                  </div>

                  {/* Staff ID */}
                  <p className="text-[10px] text-[#7FB3AE]/60 mt-2 font-mono">
                    ID: {currentStaff.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── GATE ASSIGNMENT CARD ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#111918] border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-[#00A39D]" />
                  <h3 className="text-sm font-semibold">Penempatan Gate</h3>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7FB3AE]">Gate Saat Ini</span>
                    <span className="text-sm font-semibold">{currentGate.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7FB3AE]">Lokasi</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#7FB3AE]" />
                      <span className="text-sm">{currentGate.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7FB3AE]">Tipe Gate</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${gateTypeBadge.color}`}
                    >
                      {gateTypeBadge.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── SESSION STATS CARD ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-[#111918] border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="h-4 w-4 text-[#00A39D]" />
                  <h3 className="text-sm font-semibold">Statistik Sesi</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <QrCode className="h-5 w-5 text-[#00A39D] mx-auto mb-1.5" />
                    <p className="text-lg font-bold">{totalScansToday}</p>
                    <p className="text-[10px] text-[#7FB3AE]">Total Scan Hari Ini</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <Gauge className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                    <p className="text-lg font-bold">{avgPerHour}</p>
                    <p className="text-[10px] text-[#7FB3AE]">Rata-rata / Jam</p>
                  </div>
                </div>

                <Separator className="bg-white/5 my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#7FB3AE]">Total Scan (karir)</span>
                  <span className="text-sm font-semibold">
                    {currentStaff.totalScans.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── CONTACT & SUPPORT CARD ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#111918] border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Headphones className="h-4 w-4 text-[#00A39D]" />
                  <h3 className="text-sm font-semibold">Kontak & Bantuan</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00A39D]/10 shrink-0">
                      <User className="h-4 w-4 text-[#00A39D]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7FB3AE]">Supervisor</p>
                      <p className="text-sm font-medium">Andi Setiawan</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-[#7FB3AE]" />
                        <p className="text-xs text-[#7FB3AE]">0812-3456-7890</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 shrink-0">
                      <Phone className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7FB3AE]">Event Hotline</p>
                      <p className="text-sm font-medium">021-555-0123</p>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 shrink-0">
                      <Terminal className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7FB3AE]">Command Center</p>
                      <p className="text-sm font-medium">Ext. 100</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── LOGOUT BUTTON ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Button
              variant="outline"
              className="w-full h-11 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 gap-2"
              onClick={() => router.push('/')}
            >
              <LogOut className="h-4 w-4" />
              Keluar / Logout
            </Button>
          </motion.div>

          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  )
}
