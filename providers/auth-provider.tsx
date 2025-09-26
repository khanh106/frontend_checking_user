'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LoginData, RegisterApiData } from '@/types'
import { apiClient } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isLoggingIn: boolean
  login: (credentials: LoginData, redirectTo?: string) => Promise<void>
  googleLogin: () => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterApiData) => Promise<unknown>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // Kiểm tra session cookie từ server
      const userData = await apiClient.get('/me')
      
      console.log('✅ Valid session found:', userData)
      setUser(userData as User)
      return
      
    } catch (error) {
      console.log('🔍 No valid session cookie, checking localStorage...')
      
      // Fallback: kiểm tra localStorage token
      const token = localStorage.getItem('token')
      console.log('🔍 Fallback checking localStorage token:', { token: !!token })
      
      if (token && token !== 'undefined' && token !== 'null') {
        console.log('✅ Valid localStorage token found, getting user data...')
        try {
          // Thử gọi API với token từ localStorage
          const userData = await apiClient.get('/me')
          console.log('✅ User data retrieved with localStorage token:', userData)
          setUser(userData as User)
          return
        } catch (tokenError) {
          console.log('❌ Token invalid, clearing localStorage...')
          localStorage.removeItem('token')
          setUser(null)
          return
        }
      }
      
      // Nếu không có session hợp lệ
      console.log('❌ No valid session found')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginData, redirectTo?: string) => {
    setIsLoading(true)
    setIsLoggingIn(true)
    try {
      const response = await apiClient.post<{ user: User, token?: string }>('/auth/login', credentials)
      
      // Debug: Log response để xem có token không
      console.log('🔍 Login Response:', response)
      console.log('🔍 Response token:', response.token)
      
      // Lưu token vào localStorage (backup)
      if (response.token) {
        localStorage.setItem('token', response.token)
        console.log('✅ Token saved to localStorage:', response.token)
        
        // Verify token was saved
        const savedToken = localStorage.getItem('token')
        console.log('🔍 Token verification:', { saved: !!savedToken, matches: savedToken === response.token })
        
        // Nếu token không được lưu đúng, thử lại
        if (!savedToken || savedToken !== response.token) {
          console.log('⚠️ Token not saved correctly, retrying...')
          localStorage.setItem('token', response.token)
          const retryToken = localStorage.getItem('token')
          console.log('🔍 Retry verification:', { saved: !!retryToken, matches: retryToken === response.token })
        }
      }
      
      // Set user data
      if (response.user) {
        setUser(response.user)
        console.log('✅ User data set:', response.user)
      }
      
      // Đợi một chút để đảm bảo state đã được set và localStorage đã được cập nhật
      setTimeout(() => {
        console.log('🔄 Redirecting to dashboard...')
        console.log('🔍 Final token check before redirect:', localStorage.getItem('token'))
        setIsLoggingIn(false)
        router.push(redirectTo || '/dashboard')
      }, 300)
    } catch (error) {
      console.error('❌ Login error:', error)
      setIsLoggingIn(false)
      
      // Cải thiện error message
      if (error instanceof Error) {
        const errorMessage = error.message || 'Đăng nhập thất bại'
        console.error('❌ Login error details:', {
          message: errorMessage,
          code: (error as any).code,
          status: (error as any).status,
          details: (error as any).details
        })
        throw new Error(errorMessage)
      }
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async () => {
    setIsLoading(true)
    try {
      // Redirect to Google OAuth
      window.location.href = '/api/auth/google'
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterApiData) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<unknown>('/auth/register', data)
      return response // Return full response for component to handle
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Xóa token từ localStorage
      localStorage.removeItem('token')
      console.log('✅ Token cleared from localStorage')
      
      // Gọi logout API để xóa session cookie
      try {
        await apiClient.post('/auth/logout')
        console.log('✅ Session cookie cleared')
      } catch (error) {
        console.error('Error clearing session cookie:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsLoading(false)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggingIn, login, googleLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
