import { NextResponse } from 'next/server'
import { MOCK_WRISTBAND_CONFIGS, MOCK_TICKET_TYPES, MOCK_EVENT } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: 'eventId query parameter is required' },
      { status: 400 }
    )
  }

  let inventory = MOCK_TICKET_TYPES.filter(tt => tt.eventId === (eventId || MOCK_EVENT.id))
  if (eventId !== MOCK_EVENT.id) {
    inventory = []
  }

  const wristbandInventory = inventory.map(tt => ({
    id: `wi-${tt.id}`,
    tenantId: tt.tenantId,
    eventId: tt.eventId,
    color: MOCK_WRISTBAND_CONFIGS.find(wc => wc.ticketTypeId === tt.id)?.wristbandColor || 'White',
    colorHex: MOCK_WRISTBAND_CONFIGS.find(wc => wc.ticketTypeId === tt.id)?.wristbandColorHex || '#FFFFFF',
    type: MOCK_WRISTBAND_CONFIGS.find(wc => wc.ticketTypeId === tt.id)?.wristbandColor || 'Standard',
    totalStock: tt.quota,
    usedStock: tt.sold,
    remainingStock: Math.max(0, tt.quota - tt.sold),
    createdAt: tt.createdAt,
    updatedAt: tt.updatedAt,
  }))

  return NextResponse.json({
    success: true,
    data: {
      inventory: wristbandInventory,
    },
  })
}
