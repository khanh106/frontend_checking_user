import apiClient from './client'

export async function testApiConnection(): Promise<{
  success: boolean
  error?: string
  responseTime?: number
}> {
  const startTime = Date.now()
  
  try {
    await apiClient.request('/health', {
      method: 'GET',
      cache: false,
    })
    
    const responseTime = Date.now() - startTime
    
    return {
      success: true,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    }
  }
}

export async function testApiWithRetry(maxRetries: number = 3): Promise<{
  success: boolean
  attempts: number
  error?: string
}> {
  let attempts = 0
  let lastError: string | undefined
  
  while (attempts < maxRetries) {
    attempts++
    
    const result = await testApiConnection()
    
    if (result.success) {
      return {
        success: true,
        attempts,
      }
    }
    
    lastError = result.error
    
    if (attempts < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempts))
    }
  }
  
  return {
    success: false,
    attempts,
    error: lastError,
  }
}
