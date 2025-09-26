'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AttendanceChartProps } from '@/types/dashboard'
import { formatWorkingHours } from '@/lib/utils/dashboard'

export function AttendanceTrendChart({ data, period, loading = false }: AttendanceChartProps) {
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
        <h3 className="text-lg font-semibold mb-4">Xu hướng giờ làm việc</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    )
  }

  const chartData = data.map(item => ({
    ...item,
    formattedHours: formatWorkingHours(item.hours * 60),
    overtimeHours: item.overtime || 0
  }))

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Xu hướng giờ làm việc</h3>
        <div className="text-sm text-gray-500 capitalize">{period}</div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getDate()}/${date.getMonth() + 1}`
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value}h`, 
                name === 'hours' ? 'Giờ làm' : 'Giờ OT'
              ]}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('vi-VN')
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Giờ làm"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="overtimeHours" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Giờ OT"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}