interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

class TokenManager {
  private static instance: TokenManager
  private tokenData: TokenData | null = null
  private refreshPromise: Promise<TokenData> | null = null
  private listeners: Set<() => void> = new Set()

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  setTokens(data: TokenData): void {
    this.tokenData = data
    this.setCookie('access_token', data.accessToken, this.getExpirationDate(data.expiresAt))
    this.setCookie('refresh_token', data.refreshToken, this.getExpirationDate(data.expiresAt + 7 * 24 * 60 * 60 * 1000))
    this.broadcastTokenUpdate()
  }

  getAccessToken(): string | null {
    if (this.tokenData && !this.isTokenExpired()) {
      return this.tokenData.accessToken
    }
    return null
  }

  getRefreshToken(): string | null {
    if (this.tokenData) {
      return this.tokenData.refreshToken
    }
    return null
  }

  isTokenExpired(): boolean {
    if (!this.tokenData) return true
    return Date.now() >= this.tokenData.expiresAt
  }

  clearTokens(): void {
    this.tokenData = null
    this.deleteCookie('access_token')
    this.deleteCookie('refresh_token')
    this.broadcastTokenUpdate()
  }

  async refreshTokens(): Promise<TokenData> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<TokenData> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newTokenData: TokenData = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      }

      this.setTokens(newTokenData)
      return newTokenData
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  private setupAutoRefresh(): void {
    if (typeof window === 'undefined') return

    const checkAndRefresh = async () => {
      if (this.tokenData && this.isTokenExpired()) {
        try {
          await this.refreshTokens()
        } catch (error) {
          console.error('Auto refresh failed:', error)
          this.clearTokens()
        }
      }
    }

    setInterval(checkAndRefresh, 60000)
  }

  private handleTokenRefresh(): Promise<void> {
    return this.refreshTokens().then(() => {
      this.broadcastTokenUpdate()
    }).catch((error) => {
      console.error('Token refresh error:', error)
      this.clearTokens()
    })
  }

  private broadcastTokenUpdate(): void {
    this.listeners.forEach(listener => listener())
  }

  addTokenListener(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setCookie(name: string, value: string, expirationDate: Date): void {
    if (typeof document === 'undefined') return

    const secure = location.protocol === 'https:'
    const sameSite = 'strict'
    
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/; ${secure ? 'secure; ' : ''}samesite=${sameSite}`
  }

  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  private getExpirationDate(expiresAt: number): Date {
    return new Date(expiresAt)
  }

  getStoredTokens(): TokenData | null {
    if (typeof window === 'undefined') return null

    const accessToken = this.getCookie('access_token')
    const refreshToken = this.getCookie('refresh_token')
    
    if (!accessToken || !refreshToken) return null

    return {
      accessToken,
      refreshToken,
      expiresAt: this.getTokenExpiration(),
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
    return cookie ? cookie.split('=')[1] : null
  }

  private getTokenExpiration(): number {
    const token = this.getAccessToken()
    if (!token) return 0

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000
    } catch {
      return Date.now() + 3600000
    }
  }

  initialize(): void {
    const stored = this.getStoredTokens()
    if (stored) {
      this.tokenData = stored
      this.setupAutoRefresh()
    }
  }
}

export default TokenManager.getInstance()
export { TokenManager, type TokenData }
