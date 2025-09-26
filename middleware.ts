import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Debug: Log all cookies để xem backend set cookie gì
  console.log('🔍 Middleware Debug:', {
    pathname,
    cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' }))
  })
  
  // Redirect trang chủ về login nếu chưa có session
  if (pathname === '/') {
    console.log('🏠 Home page accessed - redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // DISABLE MIDDLEWARE AUTHENTICATION - Để AuthProvider xử lý
  // Vì middleware không thể truy cập localStorage
  console.log('🔒 Protected route accessed:', pathname)
  console.log('✅ Allowing access - AuthProvider will handle authentication')
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/(protected)/:path*',
    '/(auth)/:path*',
  ],
}
