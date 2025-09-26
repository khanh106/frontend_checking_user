import apiClient from './client'
import { handleApiError } from './errors'
import type { Location } from '../../types'

export interface LocationCreateData {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  description?: string
}

export interface LocationUpdateData extends Partial<LocationCreateData> {
  id: string
}

export interface LocationValidationParams {
  latitude: number
  longitude: number
  radius?: number
}

export interface LocationSearchParams {
  query?: string
  search?: string
  status?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getLocations(params?: LocationSearchParams): Promise<PaginatedResponse<Location> | Location[]> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.query) queryParams.set('query', params.query)
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())

    const endpoint = params ? `/locations?${queryParams}` : '/locations'
    
    const response = await apiClient.request<PaginatedResponse<Location> | Location[]>(endpoint, {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getLocation(id: string): Promise<Location> {
  try {
    const response = await apiClient.request<Location>(`/locations/${id}`, {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function createLocation(data: LocationCreateData): Promise<Location> {
  try {
    const response = await apiClient.request<Location>('/locations', {
      method: 'POST',
      body: data,
    })

    apiClient.invalidateCache('/locations')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function updateLocation(data: LocationUpdateData): Promise<Location> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.request<Location>(`/locations/${id}`, {
      method: 'PUT',
      body: updateData,
    })

    apiClient.invalidateCache('/locations')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function deleteLocation(id: string): Promise<void> {
  try {
    await apiClient.request(`/locations/${id}`, {
      method: 'DELETE',
    })

    apiClient.invalidateCache('/locations')
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function validateLocation(params: LocationValidationParams): Promise<{
  isValid: boolean
  message?: string
  nearbyLocations?: Location[]
}> {
  try {
    const response = await apiClient.request<{
      isValid: boolean
      message?: string
      nearbyLocations?: Location[]
    }>('/locations/validate', {
      method: 'POST',
      body: params,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getNearbyLocations(coordinates: { lat: number; lng: number }, radius: number = 1000): Promise<Location[]> {
  try {
    const response = await apiClient.request<Location[]>('/locations/nearby', {
      method: 'GET',
      body: {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        radius,
      },
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function bulkCreateLocations(locations: LocationCreateData[]): Promise<{
  success: Location[]
  failed: { data: LocationCreateData; error: string }[]
}> {
  try {
    const response = await apiClient.request<{
      success: Location[]
      failed: { data: LocationCreateData; error: string }[]
    }>('/locations/bulk', {
      method: 'POST',
      body: { locations },
    })

    apiClient.invalidateCache('/locations')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function bulkDeleteLocations(ids: string[]): Promise<{
  success: string[]
  failed: { id: string; error: string }[]
}> {
  try {
    const response = await apiClient.request<{
      success: string[]
      failed: { id: string; error: string }[]
    }>('/locations/bulk-delete', {
      method: 'DELETE',
      body: { ids },
    })

    apiClient.invalidateCache('/locations')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function updateLocationStatus(id: string, status: 'active' | 'inactive'): Promise<Location> {
  try {
    const response = await apiClient.request<Location>(`/locations/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })

    apiClient.invalidateCache('/locations')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getLocationStats(): Promise<{
  total: number
  active: number
  inactive: number
  recent: number
}> {
  try {
    const response = await apiClient.request<{
      total: number
      active: number
      inactive: number
      recent: number
    }>('/locations/stats', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function exportLocations(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/locations/export?format=${format}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Export failed')
  }

  return response.blob()
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function importLocations(file: File): Promise<{
  success: number
  failed: number
  errors: { row: number; error: string }[]
}> {
  try {
  const formData = new FormData()
  formData.append('file', file)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/locations/import`, {
    method: 'POST',
      body: formData,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Import failed')
  }

    const result = await response.json()
    apiClient.invalidateCache('/locations')
    return result
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function toggleLocationStatus(id: string): Promise<Location> {
  try {
    const location = await getLocation(id)
    const newStatus = location.isActive ? 'inactive' : 'active'
    const response = await updateLocationStatus(id, newStatus)
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}