import { NextRequest, NextResponse } from 'next/server'
import { generateGoogleAuthUrl } from '@/lib/google-oauth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state') || 'login'

    // Generate Google OAuth URL
    const authUrl = generateGoogleAuthUrl(state)

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return NextResponse.json(
      { message: 'Lỗi khởi tạo đăng nhập Google' },
      { status: 500 }
    )
  }
}
