import { NextResponse } from 'next/server'
import { MOCK_TICKETS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '20', 10)))
  const status = searchParams.get('status')
  const eventId = searchParams.get('eventId')

  let tickets = [...MOCK_TICKETS]
  if (eventId) {
    tickets = tickets.filter(t => t.eventId === eventId)
  }
  if (status) {
    tickets = tickets.filter(t => t.status === status)
  }

  const total = tickets.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = tickets.slice(start, start + perPage)

  return NextResponse.json({
    success: true,
    data,
    meta: { page, perPage, total, totalPages },
  })
}
