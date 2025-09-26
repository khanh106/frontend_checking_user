import { useState } from 'react'

export interface GeolocationState {
  loading: boolean
  error: string | null
  position: {
    lat: number
    lng: number
    accuracy: number
  } | null
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
  })

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation không được hỗ trợ trên thiết bị này',
        loading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes
      ...options,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        })
      },
      (error) => {
        let errorMessage = 'Không thể lấy vị trí hiện tại'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vui lòng cấp quyền truy cập vị trí'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Không thể xác định vị trí'
            break
          case error.TIMEOUT:
            errorMessage = 'Hết thời gian chờ lấy vị trí'
            break
        }

        setState({
          loading: false,
          error: errorMessage,
          position: null,
        })
      },
      defaultOptions
    )
  }

  return {
    ...state,
    getCurrentPosition,
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }
    
    const data = await response.json()
    
    if (data.display_name) {
      return data.display_name
    }
    
    const address = data.address
    if (address) {
      const parts = [
        address.house_number,
        address.road,
        address.suburb || address.neighbourhood,
        address.city || address.town,
        address.state,
        address.country
      ].filter(Boolean)
      
      return parts.join(', ')
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  }
  return `${(distance / 1000).toFixed(1)}km`
}
