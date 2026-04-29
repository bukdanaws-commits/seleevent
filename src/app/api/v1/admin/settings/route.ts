import { NextResponse } from 'next/server'
import { MOCK_USERS, MOCK_ORDERS, MOCK_TICKETS } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: {
        status: 'healthy',
        stats: {
          maxOpenConnections: 25,
          openConnections: 5,
          inUse: 2,
          idle: 3,
          waitCount: 0,
          waitDuration: '0s',
          maxIdleClosed: 12,
          maxLifetimeClosed: 0,
        },
      },
      sse: {
        connectedClients: 3,
      },
      counts: {
        users: MOCK_USERS.length,
        orders: MOCK_ORDERS.length,
        events: 1,
        tickets: MOCK_TICKETS.length,
      },
      version: '1.0.0',
    },
  })
}
