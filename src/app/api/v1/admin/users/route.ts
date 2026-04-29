import { NextResponse } from 'next/server'
import { MOCK_ADMIN_USERS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '20', 10)))
  const role = searchParams.get('role')

  let users = [...MOCK_ADMIN_USERS]
  if (role) {
    users = users.filter(u => u.role === role)
  }

  const total = users.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = users.slice(start, start + perPage)

  return NextResponse.json({
    success: true,
    data,
    meta: { page, perPage, total, totalPages },
  })
}
