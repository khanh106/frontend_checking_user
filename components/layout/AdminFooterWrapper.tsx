'use client'

import { Footer } from './Footer'
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AdminFooterWrapperProps {
  stats?: {
    totalUsers?: number
    activeUsers?: number
    totalLocations?: number
    systemStatus?: 'healthy' | 'warning' | 'error'
  }
}

export function AdminFooterWrapper({ stats }: AdminFooterWrapperProps) {
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalLocations: 0,
    systemStatus: 'healthy' as const,
    ...stats
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng người dùng
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {defaultStats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Người dùng hoạt động
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {defaultStats.activeUsers}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Địa điểm
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {defaultStats.totalLocations}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Trạng thái hệ thống
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getStatusColor(defaultStats.systemStatus)}`}>
                    {defaultStats.systemStatus === 'healthy' ? 'Bình thường' : 
                     defaultStats.systemStatus === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                  </span>
                  <span className={getStatusColor(defaultStats.systemStatus)}>
                    {getStatusIcon(defaultStats.systemStatus)}
                  </span>
                </div>
              </div>
              <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Phiên bản Admin v1.0.0</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>© 2024 Attendance Portal</span>
            <span>•</span>
            <span>Quản trị viên</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
