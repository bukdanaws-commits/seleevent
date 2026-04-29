import { NextResponse } from 'next/server'
import { MOCK_TICKET_TYPES, MOCK_EVENT } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId') || MOCK_EVENT.id

  const ticketTypes = MOCK_TICKET_TYPES.filter(tt => tt.eventId === eventId)

  const seatInfo = ticketTypes.map(tt => ({
    ticketTypeId: tt.id,
    name: tt.name,
    tier: tt.tier,
    zone: tt.zone,
    quota: tt.quota,
    sold: tt.sold,
    available: Math.max(0, tt.quota - tt.sold),
  }))

  const totalQuota = ticketTypes.reduce((sum, tt) => sum + tt.quota, 0)
  const totalSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0)
  const totalAvailable = Math.max(0, totalQuota - totalSold)

  return NextResponse.json({
    success: true,
    data: {
      ticketTypes: seatInfo,
      summary: {
        totalQuota,
        totalSold,
        totalAvailable,
      },
    },
  })
}
