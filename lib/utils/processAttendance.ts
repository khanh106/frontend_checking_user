import { AttendanceStats } from '@/lib/api/attendance'
import { AttendanceRecord } from '@/types'
import { differenceInDays } from 'date-fns'

export function processAttendanceData(
  attendanceList: AttendanceRecord[],
  dateRange: { from: Date; to: Date }
): AttendanceStats {
  const totalDays = differenceInDays(dateRange.to, dateRange.from) + 1

  const workingDays = attendanceList.filter(
    (record) => record.type === 'CHECK_IN'
  ).length

  const totalHours = attendanceList.length * 8 // Default 8 hours per day
  const overtimeHours = 0 // Default no overtime
  const regularHours = totalHours

  const onTimeDays = attendanceList.filter(
    (record) => record.type === 'CHECK_IN'
  ).length
  const lateDays = 0 // Default no late days
  const earlyDays = 0 // Default no early days

  const attendanceRate = totalDays > 0 ? (workingDays / totalDays) * 100 : 0
  const punctualityRate = workingDays > 0 ? (onTimeDays / workingDays) * 100 : 0

  return {
    totalDays,
    workingDays,
    totalHours,
    regularHours,
    overtimeHours,
    onTimeDays,
    lateDays,
    earlyDays,
    attendanceRate,
    punctualityRate,
  }
}