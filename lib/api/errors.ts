export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error', details?: unknown) {
    super(0, 'NETWORK_ERROR', message, details)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(401, 'AUTH_ERROR', message, details)
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Server error', details?: unknown) {
    super(500, 'SERVER_ERROR', message, details)
    this.name = 'ServerError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(404, 'NOT_FOUND', message, details)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden', details?: unknown) {
    super(403, 'FORBIDDEN', message, details)
    this.name = 'ForbiddenError'
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error
  }

  if (error instanceof Error && error.name === 'AbortError') {
    throw new NetworkError('Request timeout')
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new NetworkError('Network connection failed')
  }

  if (error instanceof Error && error.message?.includes('HTTP')) {
    const statusMatch = error.message.match(/HTTP (\d+)/)
    const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500
    
    switch (statusCode) {
      case 401:
        throw new AuthenticationError('Session expired')
      case 403:
        throw new ForbiddenError('Insufficient permissions')
      case 404:
        throw new NotFoundError('Resource not found')
      case 400:
        throw new ValidationError('Invalid request data')
      case 500:
        throw new ServerError('Internal server error')
      default:
        throw new ApiError(statusCode, 'UNKNOWN_ERROR', error.message)
    }
  }

  throw new ServerError('An unexpected error occurred')
}

export function getErrorMessage(error: ApiError): string {
  const userMessages: Record<string, string> = {
    'AUTH_ERROR': 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.',
    'VALIDATION_ERROR': 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
    'NETWORK_ERROR': 'Lỗi kết nối mạng. Vui lòng thử lại sau.',
    'SERVER_ERROR': 'Lỗi hệ thống. Vui lòng liên hệ hỗ trợ.',
    'NOT_FOUND': 'Không tìm thấy dữ liệu yêu cầu.',
    'FORBIDDEN': 'Bạn không có quyền thực hiện hành động này.',
  }

  return userMessages[error.code] || error.message
}

export function shouldRetry(error: ApiError): boolean {
  const retryableCodes = ['NETWORK_ERROR', 'SERVER_ERROR']
  const retryableStatusCodes = [500, 502, 503, 504]
  
  return retryableCodes.includes(error.code) || 
         retryableStatusCodes.includes(error.statusCode)
}

export function isAuthenticationError(error: unknown): boolean {
  return error instanceof AuthenticationError || 
         (error instanceof ApiError && error.statusCode === 401)
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError || 
         (error instanceof ApiError && error.statusCode === 0)
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError || 
         (error instanceof ApiError && error.statusCode === 400)
}