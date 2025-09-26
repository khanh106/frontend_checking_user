import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// const API_CONFIG = {
//   BASE_URL: 'https://api.tira.click'
// }

// Validation schema cho register
const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Register API received body:', body)

    // Validation chỉ cho email và password
    const { name, email, password, confirmPassword } = registerSchema.parse(body)
    console.log('Validation passed for:', { name, email, password, confirmPassword })

    const tiraApiUrl = 'https://api.tira.click/auth/register'
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Tira API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error('Error calling Tira API for registration:', error)
      return NextResponse.json(
        { message: 'Không thể kết nối đến server. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('Register API error:', error)

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
