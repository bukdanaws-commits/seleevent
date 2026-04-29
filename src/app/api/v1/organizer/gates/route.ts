import { NextResponse } from 'next/server'
import { MOCK_GATES, MOCK_EVENT } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: 'eventId query parameter is required' },
      { status: 400 }
    )
  }

  let gates = [...MOCK_GATES]
  if (eventId !== MOCK_EVENT.id) {
    gates = []
  }

  // Enrich with scan stats matching Go backend's enrichedGate struct
  const enriched = gates.map(g => ({
    ...g,
    scanCount: g.totalIn + g.totalOut,
    todayIn: g.totalIn,
    todayOut: g.totalOut,
  }))

  return NextResponse.json({
    success: true,
    data: enriched,
  })
}
