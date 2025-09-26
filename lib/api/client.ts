interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
  cache?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ApiClient {
  private config: ApiConfig
  private cache: Map<string, CacheEntry<unknown>>
  private requestCounter: number = 0

  constructor(config: ApiConfig) {
    this.config = config
    this.cache = new Map()
  }

  async request<T>(endpoint: string, options: RequestOptions = { method: 'GET' }): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`
    
    const requestOptions: RequestInit = {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    }

    if (options.cache && options.method === 'GET') {
      const cached = this.getFromCache<T>(endpoint)
      if (cached) {
        return cached
      }
    }

    const startTime = Date.now()
    
    try {
      const response = await this.retryRequest(
        () => this.makeRequest(url, requestOptions),
        options.retries ?? this.config.retries
      )

      const duration = Date.now() - startTime
      console.log(`[API] ${options.method} ${endpoint} - ${response.status} (${duration}ms)`)

      const data = await this.handleResponse<T>(response)
      
      if (options.cache && options.method === 'GET') {
        this.setCache(endpoint, data)
      }

      return data
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[API] ${options.method} ${endpoint} - ERROR (${duration}ms)`, error)
      throw this.handleError(error)
    }
  }

  private async retryRequest(request: () => Promise<Response>, retries: number): Promise<Response> {
    let lastError: unknown

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await request()
        return response
      } catch (error) {
        lastError = error
        
        if (i === retries) {
          throw error
        }

        const delay = this.config.retryDelay * Math.pow(2, i)
        console.log(`[API] Retry ${i + 1}/${retries} after ${delay}ms`)
        await this.sleep(delay)
      }
    }

    throw lastError
  }

  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }

    return response.text() as T
  }

  private handleError(error: unknown): never {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection')
    }

    throw error
  }

  private setAuthHeader(headers: Record<string, string>): void {
    const token = this.getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=')
    )
    
    return tokenCookie ? tokenCookie.split('=')[1] : null
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  private setCache<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  clearCache(): void {
    this.cache.clear()
  }

  invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
})

export default apiClient
export { ApiClient, type ApiConfig, type RequestOptions }