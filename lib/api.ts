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
      baseURL: process.env.NODE_ENV === 'production' ? 'https://api.tira.click' : 'http://localhost:3000/api',
      timeout: 10000,
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
    
    // Validate URL before making request
    try {
      new URL(url)
    } catch {
      console.error('Invalid URL:', url)
      throw new Error(`Invalid URL: ${url}`)
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      // Don't retry 401 for auth endpoints (login, register, me, etc.)
      if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/') && !endpoint.includes('/me')) {
        await this.refreshToken()
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.message || `API Error: ${response.status}`) as Error & {
          code?: string
          status?: number
        }
        error.code = errorData.code
        error.status = response.status
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
      window.location.href = '/login'
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
