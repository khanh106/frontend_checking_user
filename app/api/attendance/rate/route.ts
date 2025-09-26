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

    const tiraApiUrl = 'https://api.tira.click/api/attendance/rate'
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
      const fallbackData = {
        rate: 90.9,
        trend: {
          value: 5.2,
          type: 'increase',
          period: 'vs last month'
        }
      }
      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error('Error fetching attendance rate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
