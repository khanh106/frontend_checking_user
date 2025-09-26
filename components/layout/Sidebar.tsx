'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  MapPin, 
  History, 
  FileText,
  LogOut,
  User
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface SidebarProps {
  user?: {
    name: string
    email: string
    role: string
  }
  onLogout?: () => void
}

const navigationItems = [
  {
    name: 'Tổng Quan',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: 'Vị trí',
    href: ROUTES.LOCATIONS,
    icon: MapPin,
  },
  {
    name: 'Lịch sử checking',
    href: ROUTES.HISTORY,
    icon: History,
  },
  {
    name: 'Tài Liệu Hướng Dẫn',
    href: ROUTES.HELP,
    icon: FileText,
  },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 font-sans shadow-sm">
      <div className="flex items-center p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-blue-600 font-semibold text-lg" style={{ fontSize: '18px' }}>TIRA</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <h2 className="text-gray-600 text-xs font-bold uppercase tracking-wide">
          BẢNG ĐIỀU KHIỂN CHECKING
        </h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-75",
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors duration-75"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      )}
    </div>
  )
}
