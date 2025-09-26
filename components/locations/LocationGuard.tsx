'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/providers/auth-provider'

interface LocationGuardProps {
  children: ReactNode
  requiredRole: 'admin' | 'manager' | 'user'
  fallback?: ReactNode
}

export function LocationGuard({ 
  children, 
  requiredRole, 
  fallback = null 
}: LocationGuardProps) {
  const { user } = useAuth()
  
  if (!user) {
    return <>{fallback}</>
  }

  const userRole = user.role || 'user'
  
  const hasPermission = () => {
    switch (requiredRole) {
      case 'admin':
        return userRole === 'admin'
      case 'manager':
        return userRole === 'admin' || userRole === 'manager'
      case 'user':
        return true
      default:
        return false
    }
  }

  if (!hasPermission()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface LocationPermissionProps {
  children: ReactNode
  action: 'create' | 'edit' | 'delete' | 'view'
  fallback?: ReactNode
}

export function LocationPermission({ 
  children, 
  action, 
  fallback = null 
}: LocationPermissionProps) {
  const { user } = useAuth()
  
  if (!user) {
    return <>{fallback}</>
  }

  const userRole = user.role || 'user'
  
  const canPerformAction = () => {
    switch (action) {
      case 'create':
      case 'edit':
      case 'delete':
        return userRole === 'admin' || userRole === 'manager'
      case 'view':
        return true
      default:
        return false
    }
  }

  if (!canPerformAction()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function useLocationPermissions() {
  const { user } = useAuth()
  
  const userRole = user?.role || 'user'
  
  return {
    canCreate: userRole === 'admin' || userRole === 'manager',
    canEdit: userRole === 'admin' || userRole === 'manager',
    canDelete: userRole === 'admin' || userRole === 'manager',
    canView: true,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isUser: userRole === 'user'
  }
}
