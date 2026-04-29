import { NextResponse } from 'next/server'
import { MOCK_DASHBOARD_KPIS, MOCK_LIVE_STATS, MOCK_USERS, MOCK_ORDERS, MOCK_TICKETS, MOCK_EVENT } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (eventId) {
    // Return event-specific stats (same as organizer dashboard)
    return NextResponse.json({
      success: true,
      data: {
        kpis: MOCK_DASHBOARD_KPIS,
        liveStats: MOCK_LIVE_STATS,
      },
    })
  }

  // No eventId: return global admin stats
  const totalRevenue = MOCK_ORDERS.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0)

  return NextResponse.json({
    success: true,
    data: {
      global: {
        totalUsers: MOCK_USERS.length,
        totalOrders: MOCK_ORDERS.length,
        totalEvents: 1,
        totalTickets: MOCK_TICKETS.length,
        totalRevenue,
        sseConnections: 3,
      },
      events: [
        {
          eventId: MOCK_EVENT.id,
          eventTitle: MOCK_EVENT.title,
          orderCount: MOCK_ORDERS.length,
          paidOrders: MOCK_ORDERS.filter(o => o.status === 'paid').length,
          ticketsSold: MOCK_TICKETS.filter(t => t.status !== 'cancelled' && t.status !== 'expired' && t.status !== 'pending').length,
          revenue: totalRevenue,
        },
      ],
    },
  })
}
