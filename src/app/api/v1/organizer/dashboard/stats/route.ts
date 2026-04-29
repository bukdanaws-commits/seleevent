import { NextResponse } from 'next/server'
import { MOCK_DASHBOARD_KPIS, MOCK_LIVE_STATS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: 'eventId query parameter is required' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      kpis: MOCK_DASHBOARD_KPIS,
      liveStats: MOCK_LIVE_STATS,
    },
  })
}
