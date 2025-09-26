'use client'

import { useState, useEffect, useCallback } from 'react'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { RecentActivityComponent } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { AttendanceTrendChart } from '@/components/charts/AttendanceTrendChart'
import { AttendanceRateChart } from '@/components/charts/AttendanceRateChart'
import { WeeklyHoursChart } from '@/components/charts/WeeklyHoursChart'
import { 
  getTrendData, 
  getRecentActivity,
  getAttendanceList,
  AttendanceStats,
  ChartData,
  RecentActivity
} from '@/lib/api/attendance'
import { PeriodOption, DateRange } from '@/types/dashboard'
import { calculatePeriodDates } from '@/lib/utils/dashboard'
import { processAttendanceData } from '@/lib/utils/processAttendance'
import { exportDashboardData } from '@/lib/utils/dashboard'
import { PageLoading } from '@/components/ui/loading'

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodOption>('this_month')
  const [customRange, setCustomRange] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [previousStats, setPreviousStats] = useState<AttendanceStats | null>(null)
  const [trendData, setTrendData] = useState<ChartData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      const { from, to } = period === 'custom' && customRange 
        ? customRange 
        : calculatePeriodDates(period)

      const [attendanceList, trendDataResult, activitiesData] = await Promise.all([
        getAttendanceList({ 
          page: 1, 
          limit: 100, 
          dateFrom: from, 
          dateTo: to 
        }),
        getTrendData({ 
          from, 
          to, 
          period: period === 'custom' ? 'day' : 
                 period === 'this_week' ? 'week' :
                 period === 'this_month' ? 'month' :
                 period === 'this_quarter' ? 'quarter' : 'day'
        }),
        getRecentActivity(10)
      ])

      const statsData = processAttendanceData(attendanceList, { from, to })
      setStats(statsData)
      setTrendData(trendDataResult)
      setRecentActivities(activitiesData)

      if (period !== 'custom') {
        const previousPeriod = getPreviousPeriod(period)
        const { from: prevFrom, to: prevTo } = calculatePeriodDates(previousPeriod)
        const prevAttendanceList = await getAttendanceList({ 
          page: 1, 
          limit: 100, 
          dateFrom: prevFrom, 
          dateTo: prevTo 
        })
        const prevStats = processAttendanceData(prevAttendanceList, { from: prevFrom, to: prevTo })
        setPreviousStats(prevStats)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats(null)
      setPreviousStats(null)
      setTrendData([])
      setRecentActivities([])
    } finally {
      setLoading(false)
    }
  }, [period, customRange])

  const getPreviousPeriod = (currentPeriod: PeriodOption): PeriodOption => {
    switch (currentPeriod) {
      case 'this_week':
        return 'this_week'
      case 'this_month':
        return 'this_month'
      case 'this_quarter':
        return 'this_quarter'
      default:
        return 'this_month'
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [period, customRange, loadDashboardData])

  const handlePeriodChange = (newPeriod: PeriodOption) => {
    setPeriod(newPeriod)
  }

  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range)
  }

  const handleExportReport = () => {
    if (stats) {
      exportDashboardData(stats as unknown as Record<string, unknown>, 'csv')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <PageLoading
          text="Đang tải tổng quan..."
        />
      ) : (
        <>
          <div className="p-6">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tổng quan</h1>
                  <p className="text-gray-600 mt-1">Xem tổng quan về dữ liệu chấm công của bạn</p>
                </div>
                <div className="flex justify-end">
                  <PeriodSelector
                    value={period}
                    onChange={handlePeriodChange}
                    customRange={customRange}
                    onCustomRangeChange={handleCustomRangeChange}
                  />
                </div>
              </div>
            </div>

        <div className="space-y-8">
          <QuickStats 
            data={stats || {
              totalDays: 0,
              workingDays: 0,
              totalHours: 0,
              regularHours: 0,
              overtimeHours: 0,
              onTimeDays: 0,
              lateDays: 0,
              earlyDays: 0,
              attendanceRate: 0,
              punctualityRate: 0
            }}
            previousData={previousStats || undefined}
            loading={loading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AttendanceTrendChart
              data={trendData}
              type="line"
              period={period}
              loading={loading}
            />
            
            <AttendanceRateChart
              data={stats || {
                totalDays: 0,
                workingDays: 0,
                totalHours: 0,
                regularHours: 0,
                overtimeHours: 0,
                onTimeDays: 0,
                lateDays: 0,
                earlyDays: 0,
                attendanceRate: 0,
                punctualityRate: 0
              }}
              loading={loading}
            />
          </div>

          <WeeklyHoursChart
            data={trendData}
            targetHours={8}
            loading={loading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivityComponent
              activities={recentActivities}
              loading={loading}
            />
            
            <QuickActions
              onExportReport={handleExportReport}
            />
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}