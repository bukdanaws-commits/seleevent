'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { formatRupiah } from '@/lib/utils';
import {
  useOrganizerWristbandGuide,
} from '@/hooks/use-api';
import type { ITicket, TicketStatus } from '@/lib/types';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  Ticket,
  Watch,
  MapPin,
  Calendar,
  Copy,
  CheckCircle2,
  LogIn,
  ArrowLeftRight,
  AlertCircle,
  Users,
  DoorOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── MOCK TICKET DATA FOR PARTICIPANT ────────────────────────────────────────
// TODO: Connect to real API endpoint (e.g., GET /api/v1/tickets/my-tickets)
// This page currently uses 100% hardcoded mock data with no API call.

/** Extended ticket display type for the My Tickets page */
interface MyTicketDisplay extends ITicket {
  tier: string;
  emoji: string;
  price: number;
  wristbandColor: string | null;
  wristbandColorHex: string | null;
  entryTime: string | null;
  entryGate: string | null;
}

const myTickets: MyTicketDisplay[] = [
  {
    id: 'c9a1d2e3-f4b5-6789-abcd-ef0123456789',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    eventId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ticketCode: 'SHL-JKT-VVIPPIT-0001',
    orderId: 'd7b2c3e4-f5a6-7890-bcde-f01234567890',
    ticketTypeId: 'a1b2c3d4-e5f6-7890-abcd-000000000001',
    attendeeName: 'Budi Santoso',
    attendeeEmail: 'budi.santoso@gmail.com',
    seatLabel: 'V1',
    qrData: 'SHL-JKT-VVIPPIT-0001',
    status: 'inside',
    wristbandCode: 'WB-00001',
    eventTitle: 'Sheila On 7 — JAKARTA',
    ticketTypeName: 'VVIP PIT',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-25T16:30:00Z',
    // Extended display fields
    tier: 'floor',
    emoji: '👑',
    price: 3500000,
    wristbandColor: 'Gold',
    wristbandColorHex: '#FFD700',
    entryTime: '2026-04-25T16:30:00',
    entryGate: 'VIP Gate',
  },
  {
    id: 'b8a0c1d2-e3f4-5678-9abc-def012345678',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    eventId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ticketCode: 'SHL-JKT-VIPZONE-0002',
    orderId: 'd7b2c3e4-f5a6-7890-bcde-f01234567890',
    ticketTypeId: 'a1b2c3d4-e5f6-7890-abcd-000000000002',
    attendeeName: 'Budi Santoso',
    attendeeEmail: 'budi.santoso@gmail.com',
    seatLabel: 'P5',
    qrData: 'SHL-JKT-VIPZONE-0002',
    status: 'redeemed',
    wristbandCode: 'WB-00002',
    eventTitle: 'Sheila On 7 — JAKARTA',
    ticketTypeName: 'VIP ZONE',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-24T12:00:00Z',
    // Extended display fields
    tier: 'floor',
    emoji: '⭐',
    price: 2800000,
    wristbandColor: 'Teal',
    wristbandColorHex: '#008080',
    entryTime: null,
    entryGate: null,
  },
  {
    id: 'a7900b1c-d2e3-4567-89ab-cdef01234567',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    eventId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ticketCode: 'SHL-JKT-FESTIV-0003',
    orderId: 'd7b2c3e4-f5a6-7890-bcde-f01234567890',
    ticketTypeId: 'a1b2c3d4-e5f6-7890-abcd-000000000003',
    attendeeName: 'Budi Santoso',
    attendeeEmail: 'budi.santoso@gmail.com',
    seatLabel: undefined,
    qrData: 'SHL-JKT-FESTIV-0003',
    status: 'outside',
    wristbandCode: 'WB-00003',
    eventTitle: 'Sheila On 7 — JAKARTA',
    ticketTypeName: 'FESTIVAL',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-25T17:00:00Z',
    // Extended display fields
    tier: 'floor',
    emoji: '🎵',
    price: 2200000,
    wristbandColor: 'Orange',
    wristbandColorHex: '#FF6B35',
    entryTime: '2026-04-25T16:45:00',
    entryGate: 'Gate A',
  },
  {
    id: '9680f1a0-b1c2-3456-789a-bcdef0123456',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    eventId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ticketCode: 'SHL-JKT-CAT10001',
    orderId: 'd7b2c3e4-f5a6-7890-bcde-f01234567890',
    ticketTypeId: 'a1b2c3d4-e5f6-7890-abcd-000000000004',
    attendeeName: 'Budi Santoso',
    attendeeEmail: 'budi.santoso@gmail.com',
    seatLabel: 'A5',
    qrData: 'SHL-JKT-CAT10001',
    status: 'pending',
    eventTitle: 'Sheila On 7 — JAKARTA',
    ticketTypeName: 'CAT 1',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    // Extended display fields
    tier: 'tribun',
    emoji: '🎟️',
    price: 1750000,
    wristbandColor: null,
    wristbandColorHex: null,
    entryTime: null,
    entryGate: null,
  },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

function getStatusConfig(status: TicketStatus | MyTicketDisplay['status']) {
  switch (status) {
    case 'pending':
      return {
        label: 'Belum Tukar Gelang',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: <AlertCircle className="w-3 h-3" />,
        note: 'Tukar di counter H-7 s/d H-1',
      };
    case 'redeemed':
      return {
        label: 'Sudah Tukar',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        icon: <Watch className="w-3 h-3" />,
        note: null,
      };
    case 'inside':
      return {
        label: 'Di Dalam Venue',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        icon: <LogIn className="w-3 h-3" />,
        note: null,
      };
    case 'outside':
      return {
        label: 'Di Luar',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <ArrowLeftRight className="w-3 h-3" />,
        note: 'Re-entry tersedia',
      };
  }
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function MyTicketPage() {
  const { data: guideData } = useOrganizerWristbandGuide()
  const wristbandConfigs = (() => {
    const guide = guideData as { guide: unknown[] } | undefined
    return (guide?.guide ?? []) as Record<string, unknown>[]
  })()

  const totalTickets = myTickets.length;
  const redeemed = myTickets.filter((t) => t.status !== 'pending').length;
  const inside = myTickets.filter((t) => t.status === 'inside').length;

  return (
    <div className="min-h-screen bg-[#0A0F0E]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0F0E]/95 backdrop-blur-md border-b border-[rgba(0,163,157,0.1)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00A39D]/10 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-[#00A39D]" />
            </div>
            <h1 className="text-white font-bold text-lg">Tiket Saya</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* ═══════════ SUMMARY CARD ═══════════ */}
        <Card className="bg-gradient-to-br from-[#111918] to-[#0A0F0E] border-[rgba(0,163,157,0.15)] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#00A39D] to-[#F8AD3C]" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#00A39D]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00A39D]" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Budi Santoso</p>
                <p className="text-[#7FB3AE] text-sm">Sobat Duta • 4 Tiket</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-[#0A0F0E]/80 border border-[rgba(0,163,157,0.08)]">
                <p className="text-xl font-bold text-white">{totalTickets}</p>
                <p className="text-[10px] text-[#7FB3AE]">Total Tiket</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="text-xl font-bold text-amber-400">{redeemed}</p>
                <p className="text-[10px] text-[#7FB3AE]">Sudah Tukar</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-xl font-bold text-emerald-400">{inside}</p>
                <p className="text-[10px] text-[#7FB3AE]">Di Dalam Venue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════ EVENT INFO ═══════════ */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111918] border border-[rgba(0,163,157,0.08)]">
          <Calendar className="w-4 h-4 text-[#00A39D] shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">Sheila On 7 — JAKARTA</p>
            <p className="text-xs text-[#7FB3AE]">Sabtu, 24 Mei 2025 • GBK Madya Stadium</p>
          </div>
        </div>

        {/* ═══════════ TICKET CARDS ═══════════ */}
        <div className="space-y-4">
          {myTickets.map((ticket, idx) => {
            const statusConfig = getStatusConfig(ticket.status);
            return (
              <Card
                key={ticket.ticketCode}
                className="bg-[#111918] border-[rgba(0,163,157,0.1)] overflow-hidden"
              >
                {/* Top bar with tier color */}
                <div className={cn(
                  'h-1',
                  ticket.tier === 'floor'
                    ? 'bg-gradient-to-r from-[#F8AD3C] to-[#F8AD3C]/60'
                    : 'bg-gradient-to-r from-[#00A39D] to-[#00A39D]/60'
                )} />

                <CardContent className="p-5 space-y-4">
                  {/* Ticket type header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ticket.emoji}</span>
                      <div>
                        <h3 className="text-white font-bold text-base">{ticket.ticketTypeName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-semibold',
                              ticket.tier === 'floor'
                                ? 'bg-[#F8AD3C]/10 text-[#F8AD3C] border-[#F8AD3C]/30'
                                : 'bg-white/5 text-[#7FB3AE] border-[#7FB3AE]/20'
                            )}
                          >
                            {ticket.tier.toUpperCase()}
                          </Badge>
                          {ticket.seatLabel && (
                            <span className="text-xs text-[#7FB3AE]">
                              Seat: <span className="text-white font-medium">{ticket.seatLabel}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#F8AD3C] font-bold text-sm">{formatRupiah(ticket.price)}</p>
                    </div>
                  </div>

                  <Separator className="bg-[rgba(0,163,157,0.08)]" />

                  {/* QR Code + Ticket Code */}
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-lg shrink-0">
                      <QRCodeSVG
                        value={ticket.qrData}
                        size={120}
                        level="H"
                        includeMargin={false}
                        fgColor="#0A0F0E"
                        bgColor="#ffffff"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-[10px] text-[#7FB3AE]">Kode Tiket</p>
                        <div className="flex items-center gap-1.5">
                          <p className="font-mono text-sm text-white font-bold">{ticket.ticketCode}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-[#7FB3AE] hover:text-white shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(ticket.ticketCode);
                              toast.success('Kode tiket disalin!');
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        <p className="text-[10px] text-[#7FB3AE] mb-1">Status</p>
                        <Badge variant="outline" className={cn('text-xs gap-1.5 py-1', statusConfig.color)}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Status details */}
                  <div className={cn(
                    'p-3 rounded-lg border',
                    ticket.status === 'pending'
                      ? 'bg-gray-500/5 border-gray-500/10'
                      : ticket.status === 'redeemed'
                      ? 'bg-amber-500/5 border-amber-500/10'
                      : ticket.status === 'inside'
                      ? 'bg-emerald-500/5 border-emerald-500/10'
                      : 'bg-blue-500/5 border-blue-500/10'
                  )}>
                    {ticket.status === 'pending' && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400">
                            Tukar di counter <span className="text-white font-medium">H-7 s/d H-1</span> sebelum acara
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            Bawa e-tiket ini ke counter penukaran gelang untuk mendapatkan gelang fisik
                          </p>
                        </div>
                      </div>
                    )}

                    {ticket.status === 'redeemed' && ticket.wristbandCode && (
                      <div className="flex items-start gap-2">
                        <Watch className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-white font-medium">Gelang: {ticket.wristbandCode}</span>
                            {ticket.wristbandColorHex && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full border border-white/20"
                                  style={{ backgroundColor: ticket.wristbandColorHex }}
                                />
                                <span className="text-xs text-amber-400">{ticket.wristbandColor}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-[#7FB3AE] mt-1">
                            Scan gelang di gate untuk masuk venue
                          </p>
                        </div>
                      </div>
                    )}

                    {ticket.status === 'inside' && (
                      <div className="flex items-start gap-2">
                        <LogIn className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-white font-medium">Anda sudah di dalam venue</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-[#7FB3AE]">
                            {ticket.entryTime && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Masuk: {formatTime(ticket.entryTime)}
                              </span>
                            )}
                            {ticket.entryGate && (
                              <span className="flex items-center gap-1">
                                <DoorOpen className="w-3 h-3" />
                                Gate: {ticket.entryGate}
                              </span>
                            )}
                          </div>
                          {ticket.wristbandCode && ticket.wristbandColorHex && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div
                                className="w-3 h-3 rounded-full border border-white/20"
                                style={{ backgroundColor: ticket.wristbandColorHex }}
                              />
                              <span className="text-[10px] text-amber-400 font-medium">
                                {ticket.wristbandCode} — {ticket.wristbandColor}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {ticket.status === 'outside' && (
                      <div className="flex items-start gap-2">
                        <ArrowLeftRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-white font-medium">
                            Anda sedang di luar venue
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] text-blue-400 font-medium">
                              Re-entry tersedia
                            </span>
                          </div>
                          <p className="text-[10px] text-[#7FB3AE] mt-1">
                            Scan gelang di gate untuk masuk kembali
                          </p>
                          {ticket.wristbandCode && ticket.wristbandColorHex && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div
                                className="w-3 h-3 rounded-full border border-white/20"
                                style={{ backgroundColor: ticket.wristbandColorHex }}
                              />
                              <span className="text-[10px] text-amber-400 font-medium">
                                {ticket.wristbandCode} — {ticket.wristbandColor}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Bottom ticket stub */}
                <div className="relative">
                  <Separator className="bg-[rgba(0,163,157,0.08)]" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0A0F0E]" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-[#0A0F0E]" />
                </div>
                <div className="px-5 pb-3">
                  <div className="flex items-center justify-between text-[10px] text-[#7FB3AE]/60">
                    <span>Tiket #{idx + 1} dari {totalTickets}</span>
                    <span>Powered by BSI</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ═══════════ WRISTBAND INFO ═══════════ */}
        <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <Watch className="w-4 h-4 text-[#F8AD3C]" />
              Panduan Warna Gelang
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {wristbandConfigs.map((wb, idx) => (
                <div
                  key={String(wb.ticketTypeId ?? idx)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#0A0F0E]/60 border border-[rgba(0,163,157,0.06)]"
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 border border-white/10"
                    style={{ backgroundColor: String(wb.wristbandColorHex ?? '#E5E7EB') }}
                  />
                  <div>
                    <p className="text-[11px] text-white font-medium">{String(wb.emoji ?? '')} {String(wb.ticketTypeName ?? '-')}</p>
                    <p className="text-[9px] text-[#7FB3AE]">{String(wb.wristbandColor ?? '-')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export { MyTicketPage };
