import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: vi })
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm')
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: vi })
}

export function calculateWorkingHours(checkIn: Date | string, checkOut?: Date | string): number {
  if (!checkOut) return 0
  
  const checkInDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const checkOutDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut
  
  const hours = differenceInHours(checkOutDate, checkInDate)
  const minutes = differenceInMinutes(checkOutDate, checkInDate) % 60
  
  return hours + minutes / 60
}

export function exportToCSV(data: Record<string, unknown>[], filename: string = 'data.csv'): void {
  if (!data.length) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToExcel(data: Record<string, unknown>[], filename: string = 'data.xlsx'): void {
  // TODO: Implement Excel export using xlsx library
  console.log('Excel export not implemented yet', { data, filename })
}