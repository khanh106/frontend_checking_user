import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const validateCoordinatesSchema = z.object({
  lat: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  lng: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ')
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = validateCoordinatesSchema.parse(body)

    const tiraApiUrl = 'https://api.tira.click/api/locations/validate'
    
    try {
      const response = await fetch(tiraApiUrl, {
        method: 'POST',
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
      console.error('Error calling Tira API for coordinate validation:', error)
      
      // Fallback validation logic
      const { lat, lng } = validatedData
      
      // Basic coordinate validation
      const isValid = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      
      let address = ''
      if (isValid) {
        // Mock address generation based on coordinates
        if (lat > 8 && lat < 24 && lng > 102 && lng < 110) {
          // Vietnam coordinates range
          address = `Vị trí tại ${lat.toFixed(6)}, ${lng.toFixed(6)} - Khu vực Việt Nam`
        } else {
          address = `Vị trí tại ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }
      }
      
      const result = {
        isValid,
        address: isValid ? address : undefined,
        error: isValid ? undefined : 'Tọa độ nằm ngoài phạm vi cho phép'
      }
      
      return NextResponse.json(result)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Dữ liệu tọa độ không hợp lệ', 
          details: error.issues 
        },
        { status: 400 }
      )
    }
    
    console.error('Error validating coordinates:', error)
    return NextResponse.json({ 
      isValid: false, 
      error: 'Lỗi server khi xác thực tọa độ' 
    }, { status: 500 })
  }
}
