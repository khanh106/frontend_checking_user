import apiClient from './client'
import { handleApiError } from './errors'
import type { User } from '../../types'

export interface ProfileUpdateData {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface PreferencesUpdateData {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  notifications?: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

export interface AccountSettings {
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  lastLoginAt: string
  createdAt: string
}

export async function getProfile(): Promise<User> {
  try {
    const response = await apiClient.request<User>('/me', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function updateProfile(data: ProfileUpdateData): Promise<User> {
  try {
    const response = await apiClient.request<User>('/me', {
      method: 'PUT',
      body: data,
    })

    apiClient.invalidateCache('/me')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function updatePreferences(data: PreferencesUpdateData): Promise<User> {
  try {
    const response = await apiClient.request<User>('/me/preferences', {
      method: 'PUT',
      body: data,
    })

    apiClient.invalidateCache('/me')
    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function changePassword(data: PasswordChangeData): Promise<void> {
  try {
    await apiClient.request('/me/password', {
      method: 'PUT',
      body: data,
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/me/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Avatar upload failed')
    }

    const result = await response.json()
    apiClient.invalidateCache('/me')
    return result
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function deleteAvatar(): Promise<void> {
  try {
    await apiClient.request('/me/avatar', {
      method: 'DELETE',
    })

    apiClient.invalidateCache('/me')
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getAccountSettings(): Promise<AccountSettings> {
  try {
    const response = await apiClient.request<AccountSettings>('/me/settings', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
  try {
    const response = await apiClient.request<{ qrCode: string; secret: string }>('/me/2fa/enable', {
      method: 'POST',
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function verifyTwoFactor(code: string): Promise<void> {
  try {
    await apiClient.request('/me/2fa/verify', {
      method: 'POST',
      body: { code },
    })

    apiClient.invalidateCache('/me/settings')
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function disableTwoFactor(): Promise<void> {
  try {
    await apiClient.request('/me/2fa/disable', {
      method: 'POST',
    })

    apiClient.invalidateCache('/me/settings')
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function verifyEmail(): Promise<void> {
  try {
    await apiClient.request('/me/verify-email', {
      method: 'POST',
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function verifyPhone(phone: string): Promise<{ verificationId: string }> {
  try {
    const response = await apiClient.request<{ verificationId: string }>('/me/verify-phone', {
      method: 'POST',
      body: { phone },
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function confirmPhoneVerification(verificationId: string, code: string): Promise<void> {
  try {
    await apiClient.request('/me/confirm-phone', {
      method: 'POST',
      body: { verificationId, code },
    })

    apiClient.invalidateCache('/me/settings')
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getSecurityLog(): Promise<{
  id: string
  action: string
  ip: string
  userAgent: string
  timestamp: string
  location?: string
}[]> {
  try {
    const response = await apiClient.request<{
      id: string
      action: string
      ip: string
      userAgent: string
      timestamp: string
      location?: string
    }[]>('/me/security-log', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await apiClient.request(`/me/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getActiveSessions(): Promise<{
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  current: boolean
}[]> {
  try {
    const response = await apiClient.request<{
      id: string
      device: string
      browser: string
      location: string
      lastActive: string
      current: boolean
    }[]>('/me/sessions', {
      method: 'GET',
      cache: true,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function deleteAccount(password: string): Promise<void> {
  try {
    await apiClient.request('/me', {
      method: 'DELETE',
      body: { password },
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function exportUserData(): Promise<Blob> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/me/export`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Data export failed')
    }

    return response.blob()
  } catch (error) {
    throw handleApiError(error)
  }
}
