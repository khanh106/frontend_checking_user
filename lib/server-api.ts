// Server-side API client đơn giản
export class ServerApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = 'https://api.tira.click'
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, 'GET', params)
  }

  private async request<T>(endpoint: string, method: string, params?: Record<string, string>): Promise<T> {
    // Get session from cookies
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found')
      throw new Error('No session found')
    }

    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
      if (!sessionData?.token) {
        console.log('❌ Invalid session data - missing token')
        throw new Error('Invalid session data')
      }
    } catch (error) {
      console.error('❌ Error parsing session cookie:', error)
      throw new Error('Invalid session data')
    }

    let url = `${this.baseURL}${endpoint}`
    if (params) {
      const queryParams = new URLSearchParams(params)
      url = `${url}?${queryParams}`
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Tira API error: ${response.status} - ${errorText}`)
        throw new Error(`Tira API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('❌ Error calling Tira API:', error)
      throw error // Re-throw the error instead of returning mock data
    }
  }
}

export const serverApiClient = new ServerApiClient()
