import { PeriodOption } from '@/types/dashboard'
export interface TrendData {
  value: number
  type: 'increase' | 'decrease' | 'neutral'
  period: string
}

export function calculatePeriodDates(period: PeriodOption): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'this_week': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return { from: startOfWeek, to: endOfWeek }
    }
    
    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { from: startOfMonth, to: endOfMonth }
    }
    
    case 'this_quarter': {
      const quarter = Math.floor(today.getMonth() / 3)
      const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1)
      const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0)
      return { from: startOfQuarter, to: endOfQuarter }
    }
    
    default:
      return { from: today, to: today }
  }
}

export function formatWorkingHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
}

export function calculateTrend(current: number, previous: number): TrendData {
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      type: current > 0 ? 'increase' : 'neutral',
      period: 'vs previous period'
    }
  }
  
  const percentage = ((current - previous) / previous) * 100
  const absPercentage = Math.abs(percentage)
  
  return {
    value: Math.round(absPercentage),
    type: percentage > 0 ? 'increase' : percentage < 0 ? 'decrease' : 'neutral',
    period: 'vs previous period'
  }
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'on_time':
      return 'text-green-600'
    case 'late':
      return 'text-red-600'
    case 'early':
      return 'text-yellow-600'
    case 'overtime':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'on_time':
      return 'bg-green-100'
    case 'late':
      return 'bg-red-100'
    case 'early':
      return 'bg-yellow-100'
    case 'overtime':
      return 'bg-blue-100'
    default:
      return 'bg-gray-100'
  }
}

export function exportDashboardData(data: Record<string, unknown>, format: 'csv' | 'pdf'): void {
  if (format === 'csv') {
    const csvContent = convertToCSV(data)
    downloadFile(csvContent, 'dashboard-data.csv', 'text/csv')
  } else if (format === 'pdf') {
    console.log('PDF export not implemented yet')
  }
}

function convertToCSV(data: Record<string, unknown>): string {
  const headers = Object.keys(data)
  const values = Object.values(data)
  
  return [headers.join(','), values.join(',')].join('\n')
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}