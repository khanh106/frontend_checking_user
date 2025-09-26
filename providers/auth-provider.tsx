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
      console.log('🔍 Checking session...')
      
      // Kiểm tra localStorage token trước
      const token = localStorage.getItem('token')
      console.log('🔍 Token from localStorage:', { hasToken: !!token, token: token?.substring(0, 20) + '...' })
      
      if (token && token !== 'undefined' && token !== 'null') {
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
      
      // Nếu không có token, thử kiểm tra session cookie
      try {
        const userData = await apiClient.get('/me')
        console.log('✅ Valid session cookie found:', userData)
        setUser(userData as User)
        return
      } catch (error) {
        console.log('❌ No valid session found')
        setUser(null)
      }
      
    } catch (error) {
      console.log('❌ Session check failed:', error)
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
      
      console.log('🔍 Login Response:', response)
      
      // Set user data trước
      if (response.user) {
        setUser(response.user)
        console.log('✅ User data set:', response.user)
      }
      
      // Lưu token vào localStorage
      if (response.token) {
        localStorage.setItem('token', response.token)
        console.log('✅ Token saved to localStorage')
      }
      
      // Đợi một chút để đảm bảo state đã được set
      await new Promise(resolve => setTimeout(resolve, 200))
      
      console.log('🔄 Redirecting to dashboard...')
      setIsLoggingIn(false)
      router.push(redirectTo || '/dashboard')
      
    } catch (error) {
      console.error('❌ Login error:', error)
      setIsLoggingIn(false)
      
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
