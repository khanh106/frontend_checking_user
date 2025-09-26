interface ApiEnvironment {
  name: string
  baseURL: string
  wsURL: string
  timeout: number
  retries: number
  debug: boolean
  features: Record<string, boolean>
  monitoring: {
    enabled: boolean
    reportInterval: number
  }
}

export const environments: Record<string, ApiEnvironment> = {
  development: {
    name: 'development',
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws',
    timeout: 10000,
    retries: 3,
    debug: true,
    features: {
      realtime: true,
      caching: true,
      monitoring: true,
      websocket: true,
      queue: true,
    },
    monitoring: {
      enabled: true,
      reportInterval: 60000,
    },
  },
  staging: {
    name: 'staging',
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-staging.company.com',
    wsURL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api-staging.company.com/ws',
    timeout: 8000,
    retries: 2,
    debug: true,
    features: {
      realtime: true,
      caching: true,
      monitoring: true,
      websocket: true,
      queue: true,
    },
    monitoring: {
      enabled: true,
      reportInterval: 30000,
    },
  },
  production: {
    name: 'production',
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.company.com',
    wsURL: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.company.com/ws',
    timeout: 5000,
    retries: 2,
    debug: false,
    features: {
      realtime: true,
      caching: true,
      monitoring: true,
      websocket: true,
      queue: false,
    },
    monitoring: {
      enabled: true,
      reportInterval: 60000,
    },
  },
}

export function getConfig(): ApiEnvironment {
  const env = process.env.NODE_ENV || 'development'
  return environments[env] || environments.development
}

export function isFeatureEnabled(feature: string): boolean {
  const config = getConfig()
  return config.features[feature] || false
}

export function isDebugMode(): boolean {
  const config = getConfig()
  return config.debug
}

export function getApiBaseURL(): string {
  const config = getConfig()
  return config.baseURL
}

export function getWebSocketURL(): string {
  const config = getConfig()
  return config.wsURL
}

export function getTimeout(): number {
  const config = getConfig()
  return config.timeout
}

export function getRetries(): number {
  const config = getConfig()
  return config.retries
}

export function isMonitoringEnabled(): boolean {
  const config = getConfig()
  return config.monitoring.enabled
}

export function getMonitoringInterval(): number {
  const config = getConfig()
  return config.monitoring.reportInterval
}

export const apiConfig = {
  getConfig,
  isFeatureEnabled,
  isDebugMode,
  getApiBaseURL,
  getWebSocketURL,
  getTimeout,
  getRetries,
  isMonitoringEnabled,
  getMonitoringInterval,
}

export default apiConfig
