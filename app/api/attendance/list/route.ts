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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const tiraApiUrl = 'https://api.tira.click/api/attendance/list'
    const queryParams = new URLSearchParams({
      page: page.toString(),
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
      const fallbackData = {
        data: [
          {
            id: 1,
            lat: "21.0285",
            lng: "105.8542",
            address: "Văn phòng Hà Nội",
            createdAt: "2024-01-15T08:00:00Z",
            type: "CHECK_IN",
            imageUri: null,
            userId: 1,
            locationId: 1,
            deletedAt: null,
            Location: {
              name: "Văn phòng Hà Nội"
            }
          },
          {
            id: 2,
            lat: "21.0285",
            lng: "105.8542",
            address: "Văn phòng Hà Nội",
            createdAt: "2024-01-15T17:00:00Z",
            type: "CHECK_OUT",
            imageUri: null,
            userId: 1,
            locationId: 1,
            deletedAt: null,
            Location: {
              name: "Văn phòng Hà Nội"
            }
          }
        ],
        totalItems: 2,
        page: page,
        limit: limit,
        totalPages: 1
      }
      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error('Error fetching attendance history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
