import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const toggleStatusSchema = z.object({
  isActive: z.boolean()
})


// PUT /api/locations/[id]/status
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
    const { isActive } = toggleStatusSchema.parse(body)

    const tiraApiUrl = `https://api.tira.click/api/locations/${id}/status`
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionData.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) {
        throw new Error(`Tira API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error('Error calling Tira API for location status toggle:', error)
      
      return NextResponse.json(
        { error: 'Không thể cập nhật trạng thái vị trí. Vui lòng thử lại sau.' },
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
    
    console.error('Error toggling location status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
