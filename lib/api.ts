interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
}

export class ApiClient {
  private config: ApiConfig
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  constructor() {
    this.config = {
      baseURL: '/api/proxy',
      timeout: 30000,
      retries: 3
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    let url: string
    if (endpoint.startsWith('http')) {
      url = endpoint
    } else {
      url = `${this.config.baseURL}${endpoint}`
    }
    
    // Validate URL before making request (only for absolute URLs)
    if (url.startsWith('http')) {
      try {
        new URL(url)
      } catch {
        console.error('Invalid URL:', url)
        throw new Error(`Invalid URL: ${url}`)
      }
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      // Get token from localStorage for API calls
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        signal: controller.signal,
        headers,
      })

      clearTimeout(timeoutId)

      // Don't retry 401 for any endpoints - let AuthProvider handle it
      if (response.status === 401) {
        console.log('🔍 401 Unauthorized - letting AuthProvider handle')
        // Don't auto-refresh, let AuthProvider handle session management
      }

      if (!response.ok) {
        let errorData: Record<string, unknown> = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        let errorMessage = (errorData.message as string) || (errorData.error as string) || `API Error: ${response.status}`
        
        // Fix [object Object] issue
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage)
        }
        const error = new Error(errorMessage) as Error & {
          code?: string
          status?: number
          details?: Record<string, unknown>
        }
        error.code = (errorData.code as string) || (errorData.error_code as string)
        error.status = response.status
        error.details = errorData
        
        console.error(`[API Error] ${response.status}:`, {
          message: errorMessage,
          code: error.code,
          details: errorData,
          url: url
        })
        
        throw error
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && 'status' in error) {
        throw error
      }

      if (retryCount < this.config.retries && this.isRetryableError(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000)
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      throw new Error(error instanceof Error ? error.message : 'Network error')
    }
  }

  private async refreshToken(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<void> {
    try {
      await this.post('/auth/refresh')
    } catch (error) {
      // Don't auto-redirect, let AuthProvider handle
      console.log('🔍 Token refresh failed - letting AuthProvider handle')
      throw error
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error && error.name === 'AbortError') return false
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as { status: number }).status
      if (status >= 400 && status < 500) return false
    }
    return true
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        endpoint = `${endpoint}?${queryString}`
      }
    }
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
