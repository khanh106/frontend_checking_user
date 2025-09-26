import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch('https://api.tira.click/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      let errorData: Record<string, unknown> = {}
      try {
        errorData = await response.json()
      } catch {
        const errorText = await response.text()
        errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` }
      }
      
      console.error(`[Proxy Login Error] ${response.status}:`, errorData)
      
      return NextResponse.json(
        { 
          error: typeof errorData.message === 'string' ? errorData.message : 
                 typeof errorData.error === 'string' ? errorData.error : 
                 JSON.stringify(errorData.message || errorData.error || 'Login failed'),
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy login error:', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
