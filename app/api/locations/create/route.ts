import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createLocationSchema = z.object({
  name: z.string().min(2, 'Tên vị trí phải có ít nhất 2 ký tự').max(100, 'Tên vị trí không được quá 100 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(200, 'Địa chỉ không được quá 200 ký tự'),
  latitude: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  longitude: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
  radius: z.number().min(10, 'Bán kính tối thiểu là 10m').max(1000, 'Bán kính tối đa là 1000m')
})

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
      if (!sessionData?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Check if user has permission to create locations
    const userRole = sessionData.user.role
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createLocationSchema.parse(body)

    const tiraApiUrl = 'https://api.tira.click/api/locations/create'
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Tira API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error('Error calling Tira API for location creation:', error)
      
      return NextResponse.json(
        { error: 'Không thể tạo vị trí mới. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
