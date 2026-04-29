import { NextResponse } from 'next/server'
import { MOCK_USERS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)
  let user = MOCK_USERS.find(u => u.role === 'SUPER_ADMIN')

  // Try to decode mock JWT token (3 parts separated by dots)
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      // Decode the payload (2nd part)
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      const payload = JSON.parse(payloadStr)

      // Find user by ID from payload
      if (payload.user_id) {
        const matchedUser = MOCK_USERS.find(u => u.id === payload.user_id)
        if (matchedUser) {
          user = matchedUser
        }
      }

      // Find user by role from payload (fallback for mock tokens)
      if (!user && payload.role) {
        const matchedByRole = MOCK_USERS.find(u => u.role === payload.role)
        if (matchedByRole) {
          user = matchedByRole
        }
      }
    }
  } catch {
    // JWT decode failed, use default user
  }

  // Also try matching by user ID substring in token
  if (user?.role === 'SUPER_ADMIN') {
    const matchedUser = MOCK_USERS.find(u => token.includes(u.id))
    if (matchedUser) {
      user = matchedUser
    }
  }

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Return user without sensitive data
  const { googleId, ...safeUser } = user

  return NextResponse.json({
    success: true,
    data: {
      user: safeUser,
    },
  })
}
