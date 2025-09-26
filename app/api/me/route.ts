import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    
    console.log('🔍 /api/me - Checking real session cookie:', { 
      hasCookie: !!sessionCookie,
      cookieValue: sessionCookie?.value ? sessionCookie.value.substring(0, 50) + '...' : null
    })

    if (!sessionCookie) {
      console.log('❌ No session cookie found')
      return NextResponse.json(
        { message: 'Không có session' },
        { status: 401 }
      )
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value)
      console.log('✅ Real session data parsed:', { 
        hasUser: !!sessionData.user,
        hasToken: !!sessionData.token,
        userName: sessionData.user?.name,
        userEmail: sessionData.user?.email
      })
      
      if (sessionData && sessionData.user) {
        return NextResponse.json(sessionData.user, { status: 200 })
      }
    } catch (error) {
      console.error('Error parsing session cookie:', error)
    }

    console.log('❌ Invalid session data')
    return NextResponse.json(
      { message: 'Session không hợp lệ' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Me API error:', error)

    return NextResponse.json(
      { message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
