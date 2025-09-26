'use client'

import { StatsCard } from './StatsCard'
import { AttendanceStats } from '@/lib/api/attendance'
import { formatWorkingHours, formatPercentage, calculateTrend } from '@/lib/utils/dashboard'
import { CalendarDays, Clock, Target, CheckCircle } from 'lucide-react'

interface QuickStatsProps {
  data: AttendanceStats
  previousData?: AttendanceStats
  loading?: boolean
}

export function QuickStats({ data, previousData, loading = false }: QuickStatsProps) {
  const totalDaysTrend = previousData ? calculateTrend(data.totalDays, previousData.totalDays) : undefined
  const totalHoursTrend = previousData ? calculateTrend(data.totalHours, previousData.totalHours) : undefined
  const attendanceRateTrend = previousData ? calculateTrend(data.attendanceRate, previousData.attendanceRate) : undefined
  const punctualityTrend = previousData ? calculateTrend(data.punctualityRate, previousData.punctualityRate) : undefined

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Tổng số ngày làm việc"
        value={data.totalDays}
        subtitle={`${data.workingDays} ngày công`}
        icon={CalendarDays}
        trend={totalDaysTrend}
        loading={loading}
      />
      
      <StatsCard
        title="Tổng số giờ làm"
        value={formatWorkingHours(data.totalHours * 60)}
        subtitle={`${formatWorkingHours(data.regularHours * 60)} giờ chuẩn`}
        icon={Clock}
        trend={totalHoursTrend}
        loading={loading}
      />
      
      <StatsCard
        title="Tỷ lệ chuyên cần"
        value={formatPercentage(data.attendanceRate)}
        subtitle={`${data.onTimeDays}/${data.totalDays} ngày đúng giờ`}
        icon={Target}
        trend={attendanceRateTrend}
        loading={loading}
      />
      
      <StatsCard
        title="Điểm đúng giờ"
        value={formatPercentage(data.punctualityRate)}
        subtitle={`${data.lateDays} ngày muộn, ${data.earlyDays} ngày về sớm`}
        icon={CheckCircle}
        trend={punctualityTrend}
        loading={loading}
      />
    </div>
  )
}