import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const response = await fetch('https://api.tira.click/me', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      let errorData: Record<string, unknown> = {}
      try {
        errorData = await response.json()
      } catch {
        const errorText = await response.text()
        errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` }
      }
      
      console.error(`[Proxy Me Error] ${response.status}:`, errorData)
      
      return NextResponse.json(
        { 
          error: typeof errorData.message === 'string' ? errorData.message : 
                 typeof errorData.error === 'string' ? errorData.error : 
                 JSON.stringify(errorData.message || errorData.error || 'Failed to get user info'),
          code: (errorData.code as string) || (errorData.error_code as string),
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}