import apiClient from './client'
import { handleApiError } from './errors'
import type { User } from '../../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone?: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.request('/auth/logout', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  try {
    const response = await apiClient.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await apiClient.request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  try {
    await apiClient.request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await apiClient.request('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function getCurrentUser(): Promise<User> {
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

export async function updateProfile(data: Partial<User>): Promise<User> {
  try {
    const response = await apiClient.request<User>('/me', {
      method: 'PUT',
      body: data,
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    await apiClient.request('/me', {
      method: 'DELETE',
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    await apiClient.request('/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function resendVerificationEmail(): Promise<void> {
  try {
    await apiClient.request('/auth/resend-verification', {
      method: 'POST',
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
  try {
    const response = await apiClient.request<{ qrCode: string; secret: string }>('/auth/2fa/enable', {
      method: 'POST',
    })

    return response
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function verifyTwoFactor(code: string): Promise<void> {
  try {
    await apiClient.request('/auth/2fa/verify', {
      method: 'POST',
      body: { code },
    })
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function disableTwoFactor(): Promise<void> {
  try {
    await apiClient.request('/auth/2fa/disable', {
      method: 'POST',
    })
  } catch (error) {
    throw handleApiError(error)
  }
}
