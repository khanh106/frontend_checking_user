'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AttendanceStats } from '@/lib/api/attendance'

interface AttendanceRateChartProps {
  data: AttendanceStats
  loading?: boolean
}

const COLORS = {
  onTime: '#10b981',
  late: '#ef4444',
  early: '#f59e0b'
}

export function AttendanceRateChart({ data, loading = false }: AttendanceRateChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    )
  }

  const chartData = [
    { 
      name: 'Đúng giờ', 
      value: data.onTimeDays, 
      color: COLORS.onTime,
      percentage: Math.round((data.onTimeDays / data.totalDays) * 100) || 0
    },
    { 
      name: 'Muộn', 
      value: data.lateDays, 
      color: COLORS.late,
      percentage: Math.round((data.lateDays / data.totalDays) * 100) || 0
    },
    { 
      name: 'Về sớm', 
      value: data.earlyDays, 
      color: COLORS.early,
      percentage: Math.round((data.earlyDays / data.totalDays) * 100) || 0
    }
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Tỷ lệ chuyên cần</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Tỷ lệ chuyên cần</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: number, name: string, props: any) => [
                `${value} ngày (${props.payload?.percentage || 0}%)`,
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload?.percentage || 0}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-900">
          {Math.round(data.attendanceRate)}%
        </div>
        <div className="text-sm text-gray-500">Tỷ lệ chuyên cần tổng thể</div>
      </div>
    </div>
  )
}