import { apiClient } from './api'
import { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData, ChangePasswordData, AuthResponse } from '@/types'

export async function login(credentials: LoginData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
  return response
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data)
  return response
}

export async function forgotPassword(data: ForgotPasswordData): Promise<void> {
  await apiClient.post('/auth/forgot-password', data)
}

export async function resetPassword(data: ResetPasswordData): Promise<void> {
  await apiClient.post('/auth/reset-password', data)
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await apiClient.post('/auth/change-password', data)
}

export async function logoutClient(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}
