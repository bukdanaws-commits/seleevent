import { NextResponse } from 'next/server'
import { MOCK_GATE_STAFF, MOCK_GATES, MOCK_USERS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '20', 10)))
  const eventId = searchParams.get('eventId')

  let filteredStaff = [...MOCK_GATE_STAFF]
  if (eventId) {
    const matchingGateIds = MOCK_GATES.filter(g => g.eventId === eventId).map(g => g.id)
    filteredStaff = filteredStaff.filter(gs => matchingGateIds.includes(gs.gateId))
  }

  const result = filteredStaff.map(gs => {
    const user = MOCK_USERS.find(u => u.id === gs.userId)
    const gate = MOCK_GATES.find(g => g.id === gs.gateId)
    return {
      id: gs.id,
      userId: gs.userId,
      userName: user?.name || gs.userId,
      userEmail: user?.email || '',
      gateId: gs.gateId,
      gateName: gate?.name || 'Unknown Gate',
      gateType: gate?.type || 'entry',
      shift: gs.shift || null,
      status: gs.status,
      assignedAt: gs.assignedAt,
    }
  })

  const total = result.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = result.slice(start, start + perPage)

  return NextResponse.json({
    success: true,
    data,
    meta: { page, perPage, total, totalPages },
  })
}
