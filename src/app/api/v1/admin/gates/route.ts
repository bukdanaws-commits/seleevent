import { NextResponse } from 'next/server'
import { MOCK_GATES } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '20', 10)))
  const eventId = searchParams.get('eventId')

  let gates = [...MOCK_GATES]
  if (eventId) {
    gates = gates.filter(g => g.eventId === eventId)
  }

  // Enrich with scan stats matching Go backend's enrichedGate struct
  const enriched = gates.map(g => ({
    ...g,
    scanCount: g.totalIn + g.totalOut,
    todayIn: g.totalIn,
    todayOut: g.totalOut,
  }))

  const total = enriched.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = enriched.slice(start, start + perPage)

  return NextResponse.json({
    success: true,
    data,
    meta: { page, perPage, total, totalPages },
  })
}
