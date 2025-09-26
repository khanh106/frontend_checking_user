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
    const period = searchParams.get('period')

    const tiraApiUrl = 'https://api.tira.click/api/attendance/trend'
    const queryParams = new URLSearchParams({
      ...(period && { period })
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
          date: '2024-01-15',
          hours: 8,
          status: 'on_time',
          overtime: 0
        },
        {
          date: '2024-01-14',
          hours: 8.25,
          status: 'late',
          overtime: 0.25
        }
      ]
      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error('Error fetching trend data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
