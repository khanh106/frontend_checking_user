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
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'all'

    const tiraApiUrl = 'https://api.tira.click/api/locations/list'
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status !== 'all' && { status })
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
      console.error('Error calling Tira API for locations:', error)
      
      return NextResponse.json(
        { error: 'Không thể tải danh sách vị trí. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error fetching locations list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
