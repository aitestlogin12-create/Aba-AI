import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path === '/auth' || path.startsWith('/api/auth') || path.startsWith('/api/signup')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/time-entry/:path*',
    '/reports/:path*',
    '/api/time-entries/:path*',
    '/api/reports/:path*',
    '/api/users/:path*',
  ],
}
