import { NextResponse } from 'next/server'
import { MOCK_COUNTER_STAFF, MOCK_GATE_STAFF, MOCK_COUNTERS, MOCK_GATES, MOCK_USERS, MOCK_EVENT } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  const role = searchParams.get('role')

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: 'eventId query parameter is required' },
      { status: 400 }
    )
  }

  const result: {
    id: string; userId: string; name: string; email: string; role: string;
    shift: string | null; status: string; assignment: string; location: string; assignedAt: string;
  }[] = []

  // Counter staff
  if (!role || role === 'COUNTER_STAFF') {
    for (const cs of MOCK_COUNTER_STAFF) {
      if (cs.status !== 'active') continue
      if (eventId && eventId !== MOCK_EVENT.id) continue
      const user = MOCK_USERS.find(u => u.id === cs.userId)
      const counter = MOCK_COUNTERS.find(c => c.id === cs.counterId)
      result.push({
        id: cs.id,
        userId: cs.userId,
        name: user?.name || cs.userId,
        email: user?.email || '',
        role: 'COUNTER_STAFF',
        shift: cs.shift || null,
        status: cs.status,
        assignment: 'counter',
        location: counter?.location || '',
        assignedAt: cs.assignedAt,
      })
    }
  }

  // Gate staff
  if (!role || role === 'GATE_STAFF') {
    for (const gs of MOCK_GATE_STAFF) {
      if (gs.status !== 'active') continue
      if (eventId && eventId !== MOCK_EVENT.id) continue
      const user = MOCK_USERS.find(u => u.id === gs.userId)
      const gate = MOCK_GATES.find(g => g.id === gs.gateId)
      result.push({
        id: gs.id,
        userId: gs.userId,
        name: user?.name || gs.userId,
        email: user?.email || '',
        role: 'GATE_STAFF',
        shift: gs.shift || null,
        status: gs.status,
        assignment: 'gate',
        location: gate?.location || '',
        assignedAt: gs.assignedAt,
      })
    }
  }

  return NextResponse.json({
    success: true,
    data: result,
  })
}
