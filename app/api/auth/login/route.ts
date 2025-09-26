import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    console.log('🔍 Calling real API:', { email, password })
    
    const apiResponse = await fetch('https://api.tira.click/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const apiData = await apiResponse.json()
    console.log('🔍 Real API Response:', { status: apiResponse.status, data: apiData })

    if (!apiResponse.ok) {
      if (apiResponse.status === 422) {
        return NextResponse.json(
          { message: apiData.message || 'Dữ liệu không hợp lệ', errors: apiData.message },
          { status: 422 }
        )
      }
      
      if (apiResponse.status === 401) {
        return NextResponse.json(
          { message: 'Email hoặc mật khẩu không đúng' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { message: apiData.message || 'Lỗi từ server' },
        { status: apiResponse.status }
      )
    }

    const user = {
      id: '14',
      name: 'Nguyễn Văn Khanh',
      email: email,
      role: 'employee',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const token = apiData.accessToken || apiData.token || 'real-jwt-token-' + Date.now()
    const refreshToken = apiData.refreshToken

    const sessionData = {
      user: user,
        token: token,
      refreshToken: refreshToken
    }

    const response = NextResponse.json({
      user: user,
      token: token,
      refreshToken: refreshToken,
      message: 'Đăng nhập thành công'
    }, { status: 200 })

    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    console.log('🔍 Session cookie set:', JSON.stringify(sessionData))

    return response

  } catch (error) {
    console.error('Login API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dữ liệu không hợp lệ', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
