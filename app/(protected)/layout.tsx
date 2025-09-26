'use client'

import { ClientLayout } from '@/components/layout/ClientLayout'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthLoading } from '@/components/ui/loading'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isLoggingIn, logout } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Reset hasCheckedAuth when user changes
  useEffect(() => {
    if (!user) {
      setHasCheckedAuth(false)
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !hasCheckedAuth && !isLoggingIn) {
      // Đợi lâu hơn để đảm bảo localStorage đã được cập nhật từ login
      setTimeout(() => {
        const token = localStorage.getItem('token')
        const hasValidToken = token && token !== 'undefined' && token !== 'null'
        
        console.log('🔍 ProtectedLayout checking token:', { token: !!token, hasValidToken, isLoggingIn })
        
        if (!hasValidToken) {
          console.log('❌ No valid token found, redirecting to login')
          setIsRedirecting(true)
          router.push('/login')
        } else {
          console.log('✅ Valid token found, allowing access')
        }
        
        setHasCheckedAuth(true)
      }, 500) // Tăng thời gian đợi lên 500ms
    }
  }, [isLoading, hasCheckedAuth, isLoggingIn, router])

  if (isLoading || isRedirecting) {
    return (
      <AuthLoading
        text={isRedirecting ? 'Đang chuyển hướng...' : 'Đang xác thực...'}
      />
    )
  }

  const token = localStorage.getItem('token')
  const hasValidToken = token && token !== 'undefined' && token !== 'null'
  
  if (!hasValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Phiên đăng nhập đã hết hạn
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <ClientLayout user={undefined} onLogout={logout}>
      {children}
    </ClientLayout>
  )
}
