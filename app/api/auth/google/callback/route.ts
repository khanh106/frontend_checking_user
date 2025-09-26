import { NextRequest, NextResponse } from 'next/server'
import { GOOGLE_OAUTH_CONFIG } from '@/lib/google-oauth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      const redirectUrl = state === 'login' ? '/login?error=google_auth_failed' : '/dashboard'
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${redirectUrl}`)
    }

    // Check if authorization code exists
    if (!code) {
      console.error('No authorization code received from Google')
      const redirectUrl = state === 'login' ? '/login?error=google_auth_failed' : '/dashboard'
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${redirectUrl}`)
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text())
      const redirectUrl = state === 'login' ? '/login?error=google_auth_failed' : '/dashboard'
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${redirectUrl}`)
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch(GOOGLE_OAUTH_CONFIG.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from Google:', await userInfoResponse.text())
      const redirectUrl = state === 'login' ? '/login?error=google_auth_failed' : '/dashboard'
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${redirectUrl}`)
    }

    const userInfo = await userInfoResponse.json()

    // Create session token for the user
    const sessionResponse = await fetch(`${process.env.API_BASE_URL || 'https://api.tira.click'}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userInfo.email,
        name: userInfo.name,
        google_id: userInfo.sub,
        picture: userInfo.picture
      }),
    })

    if (!sessionResponse.ok) {
      console.error('Failed to create session:', await sessionResponse.text())
      const redirectUrl = state === 'login' ? '/login?error=google_auth_failed' : '/dashboard'
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${redirectUrl}`)
    }

    await sessionResponse.json()

    // Create response with cookies
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`
    )

    // Set cookies from backend response
    const setCookies = sessionResponse.headers.get('set-cookie')
    if (setCookies) {
      response.headers.set('Set-Cookie', setCookies)
    }

    return response

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    const redirectUrl = '/login?error=google_auth_failed'
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${redirectUrl}`)
  }
}
