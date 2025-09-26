import apiClient from './client'
import { handleApiError } from './errors'
import type { AttendanceRecord, AttendanceSummary, AttendanceStatus } from '../../types'

export interface AttendanceHistoryParams {
  page: number
  limit: number
  dateFrom?: Date
  dateTo?: Date
  status?: AttendanceStatus[]
  locationId?: string
  search?: string
}

export interface PeriodParams {
  from: Date
  to: Date
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

export interface ExportParams {
  format: 'csv' | 'excel'
  dateFrom?: Date
  dateTo?: Date
  status?: AttendanceStatus[]
  locationId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getAttendanceSummary(period: PeriodParams): Promise<AttendanceSummary> {
  try {
    const response = await apiClient.request<AttendanceSummary>('/attendance/summary', {
      method: 'GET',
      body: {
        from: period.from.toISOString(),
        to: period.to.toISOString(),
        period: period.period,
      },
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getAttendanceHistory(params: AttendanceHistoryParams): Promise<PaginatedResponse<AttendanceRecord>> {
  try {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.dateFrom && { dateFrom: params.dateFrom.toISOString() }),
      ...(params.dateTo && { dateTo: params.dateTo.toISOString() }),
      ...(params.status && { status: params.status.join(',') }),
      ...(params.locationId && { locationId: params.locationId }),
      ...(params.search && { search: params.search }),
    })

    const response = await apiClient.request<PaginatedResponse<AttendanceRecord>>(
      `/attendance/history?${queryParams}`,
      {
        method: 'GET',
        cache: true,
      }
    )

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getAttendanceRecord(id: string): Promise<AttendanceRecord> {
  try {
    const response = await apiClient.request<AttendanceRecord>(`/attendance/${id}`, {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function updateAttendanceNotes(id: string, notes: string): Promise<AttendanceRecord> {
  try {
    const response = await apiClient.request<AttendanceRecord>(`/attendance/${id}`, {
      method: 'PATCH',
      body: { notes },
    })

    apiClient.invalidateCache('/attendance')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function exportAttendanceData(params: ExportParams): Promise<Blob> {
  try {
    const queryParams = new URLSearchParams({
      format: params.format,
      ...(params.dateFrom && { dateFrom: params.dateFrom.toISOString() }),
      ...(params.dateTo && { dateTo: params.dateTo.toISOString() }),
      ...(params.status && { status: params.status.join(',') }),
      ...(params.locationId && { locationId: params.locationId }),
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance/export?${queryParams}`, {
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

export async function getAttendanceStats(period: PeriodParams): Promise<{
  totalDays: number
  totalHours: number
  averageHours: number
  onTimeRate: number
  lateRate: number
  overtimeHours: number
}> {
  try {
    const response = await apiClient.request<{
      totalDays: number
      totalHours: number
      averageHours: number
      onTimeRate: number
      lateRate: number
      overtimeHours: number
    }>('/attendance/stats', {
      method: 'GET',
      body: {
        from: period.from.toISOString(),
        to: period.to.toISOString(),
        period: period.period,
      },
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getAttendanceTrend(period: PeriodParams): Promise<{
  date: string
  hours: number
  status: AttendanceStatus
}[]> {
  try {
    const response = await apiClient.request<{
      date: string
      hours: number
      status: AttendanceStatus
    }[]>('/attendance/trend', {
      method: 'GET',
      body: {
        from: period.from.toISOString(),
        to: period.to.toISOString(),
        period: period.period,
      },
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getWeeklyHours(): Promise<{
  week: string
  hours: number
  days: number
}[]> {
  try {
    const response = await apiClient.request<{
      week: string
      hours: number
      days: number
    }[]>('/attendance/weekly', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function checkIn(locationId: string, coordinates?: { lat: number; lng: number }): Promise<AttendanceRecord> {
  try {
    const response = await apiClient.request<AttendanceRecord>('/attendance/check-in', {
      method: 'POST',
      body: {
        locationId,
        coordinates,
      },
    })

    apiClient.invalidateCache('/attendance')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function checkOut(attendanceId: string, coordinates?: { lat: number; lng: number }): Promise<AttendanceRecord> {
  try {
    const response = await apiClient.request<AttendanceRecord>('/attendance/check-out', {
      method: 'POST',
      body: {
        attendanceId,
        coordinates,
      },
    })

    apiClient.invalidateCache('/attendance')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getCurrentAttendance(): Promise<AttendanceRecord | null> {
  try {
    const response = await apiClient.request<AttendanceRecord | null>('/attendance/current', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getAttendanceList(params: AttendanceHistoryParams): Promise<AttendanceRecord[]> {
  try {
    const response = await getAttendanceHistory(params)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getTrendData(period: PeriodParams): Promise<{
  date: string
  hours: number
  status: AttendanceStatus
}[]> {
  try {
    const response = await getAttendanceTrend(period)
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  try {
    const response = await getAttendanceHistory({
      page: 1,
      limit,
    })
    
    return response.data.map(record => ({
      id: record.id.toString(),
      userId: record.userId.toString(),
      locationId: record.locationId?.toString() || '',
      location: record.Location?.name || 'Unknown',
      checkIn: record.type === 'CHECK_IN' ? record.createdAt : '',
      checkOut: record.type === 'CHECK_OUT' ? record.createdAt : '',
      status: 'on_time', // Default status
      hours: 0, // Default hours
      notes: '',
      type: record.type.toLowerCase(),
      timestamp: record.createdAt,
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
    }))
  } catch (error) {
    throw handleApiError(error)
  }
}

export interface AttendanceStats {
  totalDays: number
  workingDays: number
  totalHours: number
  regularHours: number
  overtimeHours: number
  onTimeDays: number
  lateDays: number
  earlyDays: number
  attendanceRate: number
  punctualityRate: number
}

export interface ChartData {
  date: string
  hours: number
  status: AttendanceStatus
  overtime?: number
}

export interface RecentActivity {
  id: string
  userId: string
  locationId: string
  location: string
  checkIn: string
  checkOut?: string
  status: AttendanceStatus
  hours: number
  notes: string
  type: string
  timestamp: string
  createdAt: string
  updatedAt: string
}