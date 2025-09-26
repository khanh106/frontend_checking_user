import type { Location, AddressParts } from '../../types'

export function calculateDistance(
  lat1: number, 
  lng1: number,
  lat2: number, 
  lng2: number
): number {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`
}

export function parseAddress(address: string): AddressParts {
  const parts = address.split(',').map(part => part.trim())
  
  if (parts.length >= 4) {
    return {
      street: parts[0],
      city: parts[1],
      state: parts[2],
      country: parts[3],
      postalCode: parts[4] || undefined
    }
  }
  
  return {
    street: address
  }
}

export function validateRadius(radius: number): boolean {
  return radius >= 10 && radius <= 1000
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function exportLocations(locations: Location[], format: 'csv' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify(locations, null, 2)
  }
  
  const headers = ['ID', 'Name', 'Address', 'Latitude', 'Longitude', 'Radius', 'Active', 'Created At', 'Updated At', 'Created By']
  const rows = locations.map(location => [
    location.id,
    location.name,
    location.address,
    location.latitude.toString(),
    location.longitude.toString(),
    location.radius.toString(),
    location.isActive ? 'Yes' : 'No',
    new Date(location.createdAt).toISOString(),
    new Date(location.updatedAt).toISOString(),
    location.createdBy
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
  
  return csvContent
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  }
  return `${(distance / 1000).toFixed(1)}km`
}

export function getLocationStatusColor(isActive: boolean): string {
  return isActive ? 'text-green-600' : 'text-red-600'
}

export function getLocationStatusText(isActive: boolean): string {
  return isActive ? 'Hoạt động' : 'Không hoạt động'
}

export function sortLocationsByDistance(
  locations: Location[], 
  userLat: number, 
  userLng: number
): Location[] {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(userLat, userLng, location.latitude, location.longitude)
    }))
    .sort((a, b) => a.distance - b.distance)
}

export function filterLocationsByRadius(
  locations: Location[], 
  userLat: number, 
  userLng: number, 
  maxRadius: number
): Location[] {
  return locations.filter(location => {
    const distance = calculateDistance(userLat, userLng, location.latitude, location.longitude)
    return distance <= maxRadius
  })
}

export function generateLocationId(): string {
  return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isValidLocationName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s\-_.,()]+$/.test(name)
}

export function isValidAddress(address: string): boolean {
  return address.length >= 5 && address.length <= 200
}

export function getLocationBounds(locations: Location[]): {
  north: number
  south: number
  east: number
  west: number
} | null {
  if (locations.length === 0) return null
  
  let north = locations[0].latitude
  let south = locations[0].latitude
  let east = locations[0].longitude
  let west = locations[0].longitude
  
  locations.forEach(location => {
    north = Math.max(north, location.latitude)
    south = Math.min(south, location.latitude)
    east = Math.max(east, location.longitude)
    west = Math.min(west, location.longitude)
  })
  
  return { north, south, east, west }
}
