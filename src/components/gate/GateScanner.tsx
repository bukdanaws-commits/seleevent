'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  ArrowRightLeft,
  RotateCcw,
  Keyboard,
  User,
  Ticket,
  Watch,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  mockGates,
  mockStaffUsers,
  mockAttendeeStatuses,
  mockGateLogs,
  wristbandConfigs,
  getAttendeeStatusBadge,
  formatTime,
} from '@/lib/operational-mock-data'
import type { AttendeeStatus } from '@/lib/operational-mock-data'

// ── CONTEXT ──────────────────────────────────────────────────────────────
const currentStaff = mockStaffUsers.find(s => s.id === 'gs-001')!
const currentGate = mockGates.find(g => g.id === 'gate-a')!

// ── SCAN RESULT TYPES ────────────────────────────────────────────────────
type ScanResultType = 'success_in' | 'success_out' | 'error_not_found' | 'error_already_inside' | 'error_not_entered' | 'error_not_redeemed' | 'idle'

interface ScanResult {
  type: ScanResultType
  attendee: AttendeeStatus | null
  message: string
}

// ── MOCK SIMULATION CODES ────────────────────────────────────────────────
const demoCodeMap: Record<string, AttendeeStatus> = {}
mockAttendeeStatuses.forEach(a => {
  demoCodeMap[a.ticketCode] = a
  if (a.wristbandCode) {
    demoCodeMap[a.wristbandCode] = a
  }
})

export function GateScanner() {
  const [searchValue, setSearchValue] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successAction, setSuccessAction] = useState<'IN' | 'OUT'>('IN')

  const handleScan = useCallback((code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return

    setIsScanning(false)

    const attendee = Object.values(demoCodeMap).find(
      a => a.ticketCode.toLowerCase() === trimmed.toLowerCase() || a.wristbandCode?.toLowerCase() === trimmed.toLowerCase()
    )

    // Determine action based on gate type
    const gateType = currentGate.type

    if (!attendee) {
      setResult({ type: 'error_not_found', attendee: null, message: 'Tiket tidak ditemukan' })
      return
    }

    if (attendee.currentStatus === 'not_redeemed') {
      setResult({ type: 'error_not_redeemed', attendee, message: 'Tiket belum ditukar gelang!' })
      return
    }

    if (gateType === 'entry') {
      if (attendee.currentStatus === 'inside') {
        setResult({ type: 'error_already_inside', attendee, message: 'Sudah di dalam venue' })
        return
      }
      setResult({ type: 'success_in', attendee, message: 'Izinkan masuk' })
    } else if (gateType === 'exit') {
      if (attendee.currentStatus !== 'inside') {
        setResult({ type: 'error_not_entered', attendee, message: 'Penonton belum masuk' })
        return
      }
      setResult({ type: 'success_out', attendee, message: 'Izinkan keluar' })
    } else {
      // Both — let user choose
      if (attendee.currentStatus === 'inside') {
        setResult({ type: 'success_out', attendee, message: 'Pilih aksi' })
      } else {
        setResult({ type: 'success_in', attendee, message: 'Pilih aksi' })
      }
    }
  }, [])

  const handleSimulateScan = useCallback(() => {
    setIsScanning(true)
    setResult(null)
    // Simulate scanning delay then show a random attendee
    setTimeout(() => {
      const inside = mockAttendeeStatuses.filter(a => a.currentStatus !== 'not_redeemed')
      const randomAttendee = inside[Math.floor(Math.random() * inside.length)]
      const code = randomAttendee.wristbandCode || randomAttendee.ticketCode
      handleScan(code)
    }, 1200)
  }, [handleScan])

  const handleManualSearch = useCallback(() => {
    if (!searchValue.trim()) return
    handleScan(searchValue)
  }, [searchValue, handleScan])

  const handleConfirm = useCallback((action: 'IN' | 'OUT') => {
    setSuccessAction(action)
    setShowSuccessOverlay(true)
    setTimeout(() => {
      setShowSuccessOverlay(false)
      setResult(null)
      setSearchValue('')
    }, 2200)
  }, [])

  const handleReset = useCallback(() => {
    setResult(null)
    setSearchValue('')
  }, [])

  const getWristbandConfig = (ticketType: string) => {
    return wristbandConfigs.find(w => w.ticketTypeName === ticketType)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── VIEWFINDER / SCANNER AREA ─────────────────────────────────── */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-5"
            >
              {/* Simulated camera viewfinder */}
              <div
                className="relative w-64 h-64 rounded-2xl bg-[#111918] border-2 border-[#00A39D]/30 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleSimulateScan}
              >
                {/* Scan grid lines */}
                <div className="absolute inset-0">
                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#00A39D] rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#00A39D] rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#00A39D] rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#00A39D] rounded-br-lg" />
                  {/* Center cross */}
                  <div className="absolute top-1/2 left-4 right-4 h-px bg-[#00A39D]/20" />
                  <div className="absolute left-1/2 top-4 bottom-4 w-px bg-[#00A39D]/20" />
                </div>

                {isScanning ? (
                  <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: [-100, 100, -100] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-[#00A39D] to-transparent"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#7FB3AE] z-10">
                    <ScanLine className="h-10 w-10 text-[#00A39D]/60" />
                    <p className="text-xs font-medium">Tap untuk scan simulasi</p>
                  </div>
                )}
              </div>

              {/* Gate action context */}
              <div className="flex items-center gap-2">
                {currentGate.type === 'entry' && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1.5 px-3 py-1">
                    <LogIn className="h-3.5 w-3.5" />
                    MASUK
                  </Badge>
                )}
                {currentGate.type === 'exit' && (
                  <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 gap-1.5 px-3 py-1">
                    <LogOut className="h-3.5 w-3.5" />
                    KELUAR
                  </Badge>
                )}
                {currentGate.type === 'both' && (
                  <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 gap-1.5 px-3 py-1">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    MASUK / KELUAR
                  </Badge>
                )}
              </div>

              <p className="text-[11px] text-[#7FB3AE] text-center max-w-[260px]">
                Arahkan kamera ke QR code gelang atau tiket penonton
              </p>

              {/* Manual input */}
              <div className="w-full max-w-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7FB3AE]" />
                    <Input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                      placeholder="Scan gelang / tiket..."
                      className="pl-9 h-10 bg-[#111918] border-white/10 text-sm placeholder:text-[#7FB3AE]/50 focus:border-[#00A39D]/50"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleManualSearch}
                    className="h-10 bg-[#00A39D] hover:bg-[#00A39D]/80 text-white shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── SCAN RESULT PANEL ──────────────────────────────────────── */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full px-1"
            >
              {/* Error states */}
              {(result.type === 'error_not_found' ||
                result.type === 'error_already_inside' ||
                result.type === 'error_not_entered') && (
                <Card className="bg-[#111918] border-white/5">
                  <CardContent className="p-5 flex flex-col items-center gap-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                      {result.type === 'error_not_found' ? (
                        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                          <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                      ) : result.type === 'error_already_inside' ? (
                        <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                          <AlertTriangle className="h-8 w-8 text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                          <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                      )}
                    </motion.div>
                    <div>
                      <h3 className="text-base font-bold text-white">{result.message}</h3>
                      <p className="text-xs text-[#7FB3AE] mt-1">
                        {result.type === 'error_not_found' && 'Pastikan kode tiket atau gelang sudah benar'}
                        {result.type === 'error_already_inside' && 'Penonton sudah berada di dalam venue saat ini'}
                        {result.type === 'error_not_entered' && 'Penonton belum melakukan scan masuk sebelumnya'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="mt-2 border-white/10 text-[#7FB3AE] hover:text-white hover:bg-white/5"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Scan Ulang
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Not redeemed warning */}
              {result.type === 'error_not_redeemed' && result.attendee && (
                <Card className="bg-[#111918] border-amber-500/30">
                  <CardContent className="p-5 flex flex-col items-center gap-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-amber-400" />
                      </div>
                    </motion.div>
                    <div>
                      <h3 className="text-base font-bold text-amber-400">{result.message}</h3>
                      <p className="text-xs text-[#7FB3AE] mt-1">
                        Penonton harus menukar tiket dengan gelang di counter redeem terlebih dahulu
                      </p>
                    </div>
                    {/* Show partial info */}
                    <div className="w-full bg-[#0A0F0E] rounded-xl p-3 text-left space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-[#7FB3AE]" />
                        <span className="text-white font-medium">{result.attendee.userName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#7FB3AE]">
                        <Ticket className="h-3 w-3" />
                        <span>{result.attendee.ticketType}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-white/10 text-[#7FB3AE] hover:text-white hover:bg-white/5"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Scan Ulang
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Success states (entry / exit) */}
              {(result.type === 'success_in' || result.type === 'success_out') && result.attendee && (
                <Card className="bg-[#111918] border-white/5">
                  <CardContent className="p-5 space-y-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00A39D]/15">
                          <User className="h-5 w-5 text-[#00A39D]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">
                            {result.attendee.userName}
                          </h3>
                          <p className="text-[11px] text-[#7FB3AE] mt-0.5">
                            {result.attendee.ticketType}
                          {result.attendee.seatLabel ? ` · Seat ${result.attendee.seatLabel}` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn('text-[10px] border', getAttendeeStatusBadge(result.attendee.currentStatus).color)}>
                        {getAttendeeStatusBadge(result.attendee.currentStatus).label}
                      </Badge>
                    </div>

                    {/* Detail rows */}
                    <div className="bg-[#0A0F0E] rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#7FB3AE]">
                          <Ticket className="h-3.5 w-3.5" />
                          <span>Tiket</span>
                        </div>
                        <span className="text-xs font-mono text-white">{result.attendee.ticketCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#7FB3AE]">
                          <Watch className="h-3.5 w-3.5" />
                          <span>Gelang</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.attendee.wristbandCode && (
                            <>
                              <span
                                className="w-3 h-3 rounded-full border border-white/20"
                                style={{ backgroundColor: getWristbandConfig(result.attendee.ticketType)?.wristbandColorHex || '#888' }}
                              />
                              <span className="text-xs font-mono text-white">{result.attendee.wristbandCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {result.attendee.wristbandCode && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7FB3AE]">Tipe Gelang</span>
                          <span className="text-xs text-white">
                            {getWristbandConfig(result.attendee.ticketType)?.wristbandType || '-'}
                          </span>
                        </div>
                      )}
                      {result.attendee.reentryCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7FB3AE]">Re-entry</span>
                          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                            {result.attendee.reentryCount}x
                          </Badge>
                        </div>
                      )}
                      {result.attendee.gateUsed && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#7FB3AE]">Gate Terakhir</span>
                          <span className="text-xs text-white">{result.attendee.gateUsed}</span>
                        </div>
                      )}
                    </div>

                    {/* Not redeemed warning line */}
                    {result.attendee.currentStatus === 'redeemed' && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span className="text-[11px] text-amber-300">Tiket belum ditukar gelang!</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    {currentGate.type === 'both' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleConfirm('IN')}
                          className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm gap-2"
                        >
                          <LogIn className="h-4 w-4" />
                          IZINKAN MASUK
                        </Button>
                        <Button
                          onClick={() => handleConfirm('OUT')}
                          className="h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          IZINKAN KELUAR
                        </Button>
                      </div>
                    ) : result.type === 'success_in' ? (
                      <Button
                        onClick={() => handleConfirm('IN')}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        IZINKAN MASUK
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConfirm('OUT')}
                        className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        IZINKAN KELUAR
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    )}

                    {/* Reset */}
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="w-full text-[#7FB3AE] hover:text-white hover:bg-white/5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Scan Berikutnya
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SUCCESS OVERLAY ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A0F0E]/95 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn(
                'w-28 h-28 rounded-full flex items-center justify-center mb-6',
                successAction === 'IN' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              )}
            >
              <CheckCircle2
                className={cn(
                  'h-16 w-16',
                  successAction === 'IN' ? 'text-emerald-400' : 'text-amber-400'
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                'text-7xl font-black tracking-widest',
                successAction === 'IN' ? 'text-emerald-400' : 'text-amber-400'
              )}
            >
              {successAction === 'IN' ? 'IN' : 'OUT'}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[#7FB3AE] mt-2"
            >
              {successAction === 'IN' ? 'Penonton berhasil masuk' : 'Penonton berhasil keluar'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
