'use client'

import { HistoryStats as HistoryStatsType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface HistoryStatsProps {
  stats: HistoryStatsType
}

export function HistoryStatsComponent({ stats }: HistoryStatsProps) {
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số bản ghi</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecords}</div>
          <p className="text-xs text-muted-foreground">
            Bản ghi chấm công
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng giờ làm</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(stats.totalWorkingHours)}</div>
          <p className="text-xs text-muted-foreground">
            Trung bình {formatHours(stats.averageHoursPerDay)}/ngày
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Giờ tăng ca</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(stats.totalOvertimeHours)}</div>
          <p className="text-xs text-muted-foreground">
            Giờ làm thêm
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tỷ lệ chuyên cần</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(stats.onTimeRate)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đúng giờ: {formatPercentage(stats.onTimeRate)}
            </Badge>
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Muộn: {formatPercentage(stats.lateRate)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Vắng: {formatPercentage(stats.absentRate)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
