export const vercelConfig = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tira.click',
    timeout: 30000,
    retries: 3,
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  },
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isVercel: process.env.VERCEL === '1',
  },
}

export function getApiUrl(path: string): string {
  const baseURL = vercelConfig.api.baseURL
  return `${baseURL}${path.startsWith('/') ? path : `/${path}`}`
}

export function isVercelEnvironment(): boolean {
  return vercelConfig.environment.isVercel
}

export function getEnvironmentConfig() {
  return vercelConfig.environment
}
