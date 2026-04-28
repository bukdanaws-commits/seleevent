// ─── SELEEVENT MIDDLEWARE ──────────────────────────────────────────────────
// Route protection based on user role
// In development mode: allow all routes through (client-side handles redirect)
// In production: check sele_role cookie for route access

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── PUBLIC ROUTES (no auth required) ──────────────────────────────────────

const PUBLIC_ROUTES = ['/', '/api/v1/auth', '/api/v1/payment/callback']

// ─── PROTECTED ROUTE PREFIXES ──────────────────────────────────────────────

const PROTECTED_PREFIXES = ['/admin', '/organizer', '/counter', '/gate']

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files, images, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff')
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected) {
    return NextResponse.next()
  }

  // In development: allow all protected routes (client-side handles auth)
  // In production: check for auth cookie
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Production: check role cookie
  const authRole = request.cookies.get('sele_role')?.value

  if (!authRole) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
