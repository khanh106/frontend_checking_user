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
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    const tiraApiUrl = `https://api.tira.click/api/locations/search?q=${encodeURIComponent(query)}`
    
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
      console.error('Error calling Tira API for location search:', error)
      
      return NextResponse.json(
        { error: 'Không thể tìm kiếm vị trí. Vui lòng thử lại sau.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error searching locations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
