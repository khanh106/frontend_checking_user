'use client'

import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-10 h-10'
}

export function Loading({
  size = 'md',
  text = 'Đang tải...',
  className,
  fullScreen = false
}: LoadingProps) {
  const containerClass = fullScreen 
    ? 'min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'
    : 'flex items-center justify-center'

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className={cn(
          'border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin',
          sizeClasses[size]
        )} />
        
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export function PageLoading({ 
  text = 'Đang tải trang...' 
}: { text?: string }) {
  return (
    <Loading
      size="lg"
      text={text}
      fullScreen
    />
  )
}

export function AuthLoading({ 
  text = 'Đang xác thực...' 
}: { text?: string }) {
  return (
    <Loading
      size="md"
      text={text}
      fullScreen
    />
  )
}

export function DataLoading({ 
  text = 'Đang tải dữ liệu...' 
}: { text?: string }) {
  return (
    <Loading
      size="sm"
      text={text}
    />
  )
}
