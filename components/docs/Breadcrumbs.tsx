'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ChevronRight, 
  Home, 
  ArrowLeft, 
  ExternalLink 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  showBack?: boolean
  className?: string
  onBack?: () => void
}

export function Breadcrumbs({ 
  items, 
  showHome = true, 
  showBack = true, 
  className,
  onBack 
}: BreadcrumbsProps) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  const allItems = showHome 
    ? [{ label: 'Trang chủ', href: '/', icon: <Home className="w-4 h-4" /> }, ...items]
    : items

  return (
    <nav 
      className={cn("flex items-center space-x-2 py-3", className)}
      aria-label="Breadcrumb"
    >
      {/* Back button */}
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mr-4 p-2 h-8 w-8"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Breadcrumb items */}
      <ol className="flex items-center space-x-2 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          
          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {/* Breadcrumb item */}
              <div className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors",
                      (item as BreadcrumbItem).isActive && "text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.href.startsWith('http') && (
                      <ExternalLink className="w-3 h-3 ml-1" />
                    )}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "flex items-center space-x-1",
                      isLast 
                        ? "text-gray-900 dark:text-gray-100 font-medium" 
                        : "text-gray-600 dark:text-gray-400"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Specialized breadcrumb for documentation
interface DocBreadcrumbsProps {
  section?: string
  subsection?: string
  className?: string
}

export function DocBreadcrumbs({ section, subsection, className }: DocBreadcrumbsProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Hướng dẫn', href: '/help' }
  ]

  if (section) {
    items.push({ 
      label: section, 
      href: subsection ? `/help#${section.toLowerCase().replace(/\s+/g, '-')}` : undefined,
      isActive: !subsection
    })
  }

  if (subsection) {
    items.push({ 
      label: subsection, 
      isActive: true 
    })
  }

  return <Breadcrumbs items={items} className={className} />
}

// Auto-generating breadcrumbs from URL
interface AutoBreadcrumbsProps {
  className?: string
  showHome?: boolean
  labels?: Record<string, string>
}

export function AutoBreadcrumbs({ 
  className, 
  showHome = true, 
  labels = {} 
}: AutoBreadcrumbsProps) {
  // This would be implemented with Next.js router
  // For now, we'll use a mock implementation
  
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const segments = pathname.split('/').filter(Boolean)
  
  const defaultLabels: Record<string, string> = {
    'help': 'Hướng dẫn',
    'dashboard': 'Trang tổng quan',
    'locations': 'Quản lý vị trí',
    'history': 'Lịch sử',
    'settings': 'Cài đặt',
    'login': 'Đăng nhập',
    'register': 'Đăng ký',
    ...labels
  }

  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = defaultLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isActive = index === segments.length - 1

    return {
      label,
      href: isActive ? undefined : href,
      isActive
    }
  })

  return (
    <Breadcrumbs 
      items={items} 
      showHome={showHome} 
      className={className} 
    />
  )
}

// Breadcrumbs with custom styling for different contexts
interface ThemedBreadcrumbsProps extends BreadcrumbsProps {
  theme?: 'default' | 'minimal' | 'pills'
}

export function ThemedBreadcrumbs({ theme = 'default', ...props }: ThemedBreadcrumbsProps) {
  const themeClasses = {
    default: '',
    minimal: 'text-xs bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg',
    pills: 'bg-white dark:bg-gray-800 border rounded-full px-4 py-2 shadow-sm'
  }

  return (
    <Breadcrumbs 
      {...props} 
      className={cn(themeClasses[theme], props.className)}
    />
  )
}
