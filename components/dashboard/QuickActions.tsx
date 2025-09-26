'use client'

import Link from 'next/link'
import { 
  History, 
  Download, 
  MapPin, 
  HelpCircle, 
  FileText,
  Settings 
} from 'lucide-react'

interface QuickActionsProps {
  onExportReport?: () => void
}

export function QuickActions({ onExportReport }: QuickActionsProps) {
  const actions = [
    {
      title: 'Xem lịch sử',
      description: 'Xem chi tiết lịch sử chấm công',
      icon: History,
      href: '/history',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Xuất báo cáo',
      description: 'Tải xuống báo cáo Excel/PDF',
      icon: Download,
      onClick: onExportReport,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Quản lý vị trí',
      description: 'Thêm/sửa vị trí công ty',
      icon: MapPin,
      href: '/locations',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Hướng dẫn',
      description: 'Xem hướng dẫn sử dụng',
      icon: HelpCircle,
      href: '/help',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Cài đặt',
      description: 'Thay đổi mật khẩu',
      icon: Settings,
      href: '/settings/change-password',
      color: 'bg-gray-50 text-gray-600'
    },
    {
      title: 'Báo cáo chi tiết',
      description: 'Xem báo cáo phân tích',
      icon: FileText,
      href: '/reports',
      color: 'bg-indigo-50 text-indigo-600'
    }
  ]

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Thao tác nhanh</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          
          if (action.href) {
            return (
              <Link
                key={index}
                href={action.href}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          }
          
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors group text-left w-full"
            >
              <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {action.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}