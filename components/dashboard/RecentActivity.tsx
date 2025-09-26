'use client'

import { RecentActivity } from '@/lib/api/attendance'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MapPin, Clock, CheckCircle, AlertCircle, ArrowUp } from 'lucide-react'
import { getStatusColor, getStatusBgColor } from '@/lib/utils/dashboard'

interface RecentActivityProps {
  activities: RecentActivity[]
  loading?: boolean
}

export function RecentActivityComponent({ activities, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có hoạt động nào</p>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string, status: string) => {
    if (type === 'check_in') {
      return status === 'on_time' ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> : 
        <AlertCircle className="h-5 w-5 text-red-600" />
    } else {
      return <ArrowUp className="h-5 w-5 text-blue-600" />
    }
  }

  const getActivityText = (type: string, status: string) => {
    if (type === 'check_in') {
      return status === 'on_time' ? 'Check-in đúng giờ' : 'Check-in muộn'
    } else {
      return 'Check-out'
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
        <a 
          href="/history" 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xem tất cả
        </a>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-full ${getStatusBgColor(activity.status)}`}>
              {getActivityIcon(activity.type, activity.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {getActivityText(activity.type, activity.status)}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBgColor(activity.status)} ${getStatusColor(activity.status)}`}>
                  {activity.status === 'on_time' ? 'Đúng giờ' : 
                   activity.status === 'late' ? 'Muộn' : 'Sớm'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{activity.location}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}