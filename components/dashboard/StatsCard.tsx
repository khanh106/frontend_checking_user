'use client'

import { cn } from '@/lib/utils'
import { StatsCardProps } from '@/types/dashboard'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  loading = false 
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600'
    
    switch (trend.type) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={cn("flex items-center space-x-1 text-sm", getTrendColor())}>
              {getTrendIcon()}
              <span>{trend.value}%</span>
              <span className="text-xs text-gray-500">{trend.period}</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
    </div>
  )
}