import { apiClient } from '../api'
import { serverApiClient } from '../server-api'
import { AttendanceRecord, HistoryFilters, HistoryParams, HistoryResponse, HistoryStats } from '@/types'

export type AttendanceStatus = 'on_time' | 'late' | 'early' | 'overtime' | 'absent'

export async function getAttendanceHistory(params: HistoryParams): Promise<HistoryResponse> {
  // Use server API client for server-side rendering
  const client = typeof window === 'undefined' ? serverApiClient : apiClient
  
  const queryParams: Record<string, string> = {
    page: params.page.toString(),
    limit: params.limit.toString(),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    ...(params.dateFrom && { dateFrom: params.dateFrom.toISOString().split('T')[0] }),
    ...(params.dateTo && { dateTo: params.dateTo.toISOString().split('T')[0] }),
    ...(params.status && params.status.length > 0 && { status: params.status.join(',') }),
    ...(params.locationId && { locationId: params.locationId }),
    ...(params.search && { search: params.search })
  }

  const response = await client.get<HistoryResponse>(`/attendance/list`, queryParams)
  return response
}

export async function getAttendanceRecord(id: string): Promise<AttendanceRecord> {
  const response = await apiClient.get<AttendanceRecord>(`/attendance/history/${id}`)
  return response
}

export async function updateAttendanceNotes(id: string, notes: string): Promise<AttendanceRecord> {
  const response = await apiClient.put<AttendanceRecord>(`/attendance/history/${id}/notes`, { notes })
  return response
}

export async function getHistoryStats(filters: HistoryFilters): Promise<HistoryStats> {
  const client = typeof window === 'undefined' ? serverApiClient : apiClient
  
  const queryParams: Record<string, string> = {
    ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString().split('T')[0] }),
    ...(filters.dateTo && { dateTo: filters.dateTo.toISOString().split('T')[0] }),
    ...(filters.status && filters.status.length > 0 && { status: filters.status.join(',') }),
    ...(filters.locationId && { locationId: filters.locationId }),
    ...(filters.search && { search: filters.search })
  }

  const response = await client.get<HistoryStats>(`/attendance/stats`, queryParams)
  return response
}

export async function exportAttendanceHistory(
  filters: HistoryFilters, 
  format: 'csv' | 'excel'
): Promise<Blob> {
  const searchParams = new URLSearchParams()
  
  searchParams.append('format', format)
  
  if (filters.dateFrom) {
    searchParams.append('dateFrom', filters.dateFrom.toISOString())
  }
  if (filters.dateTo) {
    searchParams.append('dateTo', filters.dateTo.toISOString())
  }
  if (filters.status && filters.status.length > 0) {
    searchParams.append('status', filters.status.join(','))
  }
  if (filters.locationId) {
    searchParams.append('locationId', filters.locationId)
  }
  if (filters.search) {
    searchParams.append('search', filters.search)
  }

  const response = await fetch(`/api/attendance/export?${searchParams.toString()}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Export failed')
  }
  
  return response.blob()
}

export async function bulkUpdateNotes(recordIds: string[], notes: string): Promise<void> {
  await apiClient.put('/attendance/bulk-notes', {
    recordIds,
    notes
  })
}

export async function bulkExportRecords(recordIds: string[], format: 'csv' | 'excel'): Promise<Blob> {
  const response = await fetch('/api/attendance/bulk-export', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recordIds,
      format
    })
  })
  
  if (!response.ok) {
    throw new Error('Bulk export failed')
  }
  
  return response.blob()
}
