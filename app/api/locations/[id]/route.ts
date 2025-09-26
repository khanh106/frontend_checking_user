import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateLocationSchema = z.object({
  name: z.string().min(2, 'Tên vị trí phải có ít nhất 2 ký tự').max(100, 'Tên vị trí không được quá 100 ký tự').optional(),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(200, 'Địa chỉ không được quá 200 ký tự').optional(),
  latitude: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ').optional(),
  longitude: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ').optional(),
  radius: z.number().min(10, 'Bán kính tối thiểu là 10m').max(1000, 'Bán kính tối đa là 1000m').optional(),
  isActive: z.boolean().optional()
})


// GET /api/locations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const tiraApiUrl = `https://api.tira.click/api/locations/${id}`
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionData.user.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Tira API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error('Error calling Tira API for location details:', error)
      
      return NextResponse.json(
        { error: 'Không thể tải thông tin vị trí. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/locations/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check permissions
    const userRole = sessionData.user.role
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateLocationSchema.parse(body)

    const tiraApiUrl = `https://api.tira.click/api/locations/${id}`
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionData.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData)
      })

      if (!response.ok) {
        throw new Error(`Tira API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error('Error calling Tira API for location update:', error)
      
      return NextResponse.json(
        { error: 'Không thể cập nhật vị trí. Vui lòng thử lại sau.' },
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
    
    console.error('Error updating location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/locations/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check permissions
    const userRole = sessionData.user.role
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const tiraApiUrl = `https://api.tira.click/api/locations/${id}`
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionData.user.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Tira API error: ${response.status}`)
      }

      return NextResponse.json({ success: true, message: 'Location deleted successfully' })
    } catch (error) {
      console.error('Error calling Tira API for location deletion:', error)
      
      return NextResponse.json(
        { error: 'Không thể xóa vị trí. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
