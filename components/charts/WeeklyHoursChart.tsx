'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ChartData } from '@/lib/api/attendance'
import { formatWorkingHours } from '@/lib/utils/dashboard'

interface WeeklyHoursChartProps {
  data: ChartData[]
  targetHours?: number
  loading?: boolean
}

export function WeeklyHoursChart({ data, targetHours = 8, loading = false }: WeeklyHoursChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Giờ làm theo ngày</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    )
  }

  const chartData = data.map(item => ({
    ...item,
    dayName: new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
    isOvertime: item.hours > targetHours,
    overtimeHours: Math.max(0, item.hours - targetHours)
  }))

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Giờ làm theo ngày</h3>
        <div className="text-sm text-gray-500">
          Mục tiêu: {targetHours}h/ngày
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="dayName" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value}h`, 
                name === 'hours' ? 'Tổng giờ' : 'Giờ OT'
              ]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.dayName === label)
                return item ? new Date(item.date).toLocaleDateString('vi-VN') : label
              }}
            />
            <ReferenceLine 
              y={targetHours} 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              label={{ value: "Mục tiêu", position: "top" }}
            />
            <Bar 
              dataKey="hours" 
              fill="#3b82f6"
              name="Tổng giờ"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="overtimeHours" 
              fill="#f59e0b"
              name="Giờ OT"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-blue-600">
            {formatWorkingHours(chartData.reduce((sum, item) => sum + item.hours, 0) * 60)}
          </div>
          <div className="text-xs text-gray-500">Tổng giờ</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-orange-600">
            {formatWorkingHours(chartData.reduce((sum, item) => sum + item.overtimeHours, 0) * 60)}
          </div>
          <div className="text-xs text-gray-500">Giờ OT</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-green-600">
            {chartData.filter(item => item.hours >= targetHours).length}
          </div>
          <div className="text-xs text-gray-500">Ngày đạt mục tiêu</div>
        </div>
      </div>
    </div>
  )
}