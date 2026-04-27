'use client'

import { Watch, Hash } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { wristbandConfigs } from '@/lib/operational-mock-data'

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-5 p-4 max-w-lg mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Watch className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Panduan Warna Gelang
          </h1>
          <p className="text-xs text-muted-foreground">
            Referensi cepat warna gelang per tiket tier
          </p>
        </div>
      </div>

      {/* ── Wristband Cards Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {wristbandConfigs.map((wb) => (
          <Card
            key={wb.ticketTypeId}
            className="bg-[#111918] border-border/30 hover:border-primary/30 transition-colors"
          >
            <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
              {/* Color Swatch */}
              <div
                className="h-12 w-12 rounded-full border-2 border-white/10 shadow-lg"
                style={{ backgroundColor: wb.wristbandColorHex }}
              />
              {/* Tier Name */}
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {wb.ticketTypeName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {wb.wristbandColor}
                </p>
              </div>
              {/* Wristband Type */}
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                {wb.wristbandType}
              </Badge>
              {/* Hex Code */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="text-[10px] font-mono">
                  {wb.wristbandColorHex}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick Reference Table ── */}
      <Card className="bg-[#111918] border-border/30">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Tiket Tier → Warna Gelang
          </h2>
          <div className="space-y-1">
            {wristbandConfigs.map((wb, idx) => (
              <div
                key={wb.ticketTypeId}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  idx % 2 === 0 ? 'bg-[#0A0F0E]/60' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-4 w-4 rounded-full border border-white/10 shrink-0"
                    style={{ backgroundColor: wb.wristbandColorHex }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {wb.ticketTypeName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {wb.wristbandColor}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
