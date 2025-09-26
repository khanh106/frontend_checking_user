import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔍 Logout API called')
    
    const response = NextResponse.json({
      message: 'Đăng xuất thành công'
    }, { status: 200 })

    // Xóa session cookie
    response.cookies.delete('session')
    console.log('✅ Session cookie deleted')

    return response

  } catch (error) {
    console.error('Logout API error:', error)

    return NextResponse.json(
      { message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
