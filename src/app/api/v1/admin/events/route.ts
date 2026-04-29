import { NextResponse } from 'next/server'
import { MOCK_EVENTS_LIST } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_EVENTS_LIST,
  })
}
