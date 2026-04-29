import { NextResponse } from 'next/server'
import { MOCK_GATES, MOCK_GATE_LOGS, MOCK_TICKETS, MOCK_GATE_STAFF } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  const gates = eventId ? MOCK_GATES.filter(g => g.eventId === eventId) : MOCK_GATES

  const result = gates.map(g => {
    const staffForGate = MOCK_GATE_STAFF.filter(gs => gs.gateId === g.id && gs.status === 'active')
    const logsForGate = MOCK_GATE_LOGS.filter(l => l.gateId === g.id)

    // Recent scans (last 10)
    const recentScans = logsForGate.slice(0, 10).map(l => {
      const ticket = MOCK_TICKETS.find(t => t.id === l.ticketId)
      const staffUser = (gs => gs.user)(MOCK_GATE_STAFF.find(gs => gs.userId === l.staffId) || MOCK_GATE_STAFF[0])
      return {
        id: l.id,
        gateId: l.gateId,
        gateName: g.name,
        ticketCode: ticket?.ticketCode || '',
        attendeeName: ticket?.attendeeName || '',
        ticketTypeName: ticket?.ticketTypeName || '',
        action: l.action,
        scannedAt: l.scannedAt,
        staffName: staffUser?.name || '',
      }
    })

    // Throughput: 0 for mock (no real-time data)
    const lastLog = logsForGate[0]

    return {
      gateId: g.id,
      gateName: g.name,
      gateType: g.type,
      status: g.status,
      staffCount: staffForGate.length,
      totalScans: g.totalIn + g.totalOut,
      todayIn: g.totalIn,
      todayOut: g.totalOut,
      throughputPerMin: 0,
      lastScanAt: lastLog?.scannedAt || g.lastScan || undefined,
      recentScans,
    }
  })

  return NextResponse.json({
    success: true,
    data: result,
  })
}
