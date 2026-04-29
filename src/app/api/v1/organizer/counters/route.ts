import { NextResponse } from 'next/server'
import { MOCK_COUNTERS, MOCK_EVENT } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: 'eventId query parameter is required' },
      { status: 400 }
    )
  }

  let counters = [...MOCK_COUNTERS]
  if (eventId !== MOCK_EVENT.id) {
    counters = []
  }

  return NextResponse.json({
    success: true,
    data: counters,
  })
}
