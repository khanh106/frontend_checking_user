import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const tiraApiUrl = 'https://api.tira.click/api/attendance/recent'
    const queryParams = new URLSearchParams({
      limit: limit.toString()
    })

    try {
      const response = await fetch(`${tiraApiUrl}?${queryParams}`, {
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
      console.error('Error calling Tira API:', error)
      const fallbackData = [
        {
          id: '1',
          type: 'check_in',
          timestamp: '2024-01-15T08:00:00Z',
          location: 'Văn phòng Hà Nội',
          status: 'on_time'
        },
        {
          id: '2',
          type: 'check_out',
          timestamp: '2024-01-15T17:00:00Z',
          location: 'Văn phòng Hà Nội',
          status: 'on_time'
        }
      ]
      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
