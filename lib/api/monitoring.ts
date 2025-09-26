interface RequestMetrics {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  success: boolean
  timestamp: number
  requestId?: string
  errorMessage?: string
}

interface PerformanceMetrics {
  averageResponseTime: number
  errorRate: number
  successRate: number
  totalRequests: number
  failedRequests: number
}

interface ApiHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime: number
  lastError?: string
  errorCount: number
}

class ApiMonitoring {
  private metrics: RequestMetrics[] = []
  private maxMetrics: number = 1000
  private errorCount: number = 0
  private startTime: number = Date.now()
  private lastError: string | null = null

  recordRequest(metrics: RequestMetrics): void {
    this.metrics.push(metrics)
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    if (!metrics.success) {
      this.errorCount++
      this.lastError = metrics.errorMessage || 'Unknown error'
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Monitoring] ${metrics.method} ${metrics.endpoint} - ${metrics.statusCode} (${metrics.duration}ms)`)
    }
  }

  getMetrics(): RequestMetrics[] {
    return [...this.metrics]
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const totalRequests = this.metrics.length
    const failedRequests = this.metrics.filter(m => !m.success).length
    const successfulRequests = totalRequests - failedRequests

    const averageResponseTime = totalRequests > 0 
      ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
      : 0

    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0

    return {
      averageResponseTime,
      errorRate,
      successRate,
      totalRequests,
      failedRequests,
    }
  }

  getErrorRate(): number {
    const performance = this.getPerformanceMetrics()
    return performance.errorRate
  }

  getAverageResponseTime(): number {
    const performance = this.getPerformanceMetrics()
    return performance.averageResponseTime
  }

  getHealthStatus(): ApiHealth {
    const uptime = Date.now() - this.startTime
    const errorRate = this.getErrorRate()
    
    let status: 'healthy' | 'degraded' | 'unhealthy'
    
    if (errorRate < 5) {
      status = 'healthy'
    } else if (errorRate < 20) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return {
      status,
      uptime,
      lastError: this.lastError || undefined,
      errorCount: this.errorCount,
    }
  }

  getEndpointMetrics(endpoint: string): {
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    lastRequest?: RequestMetrics
  } {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint)
    const totalRequests = endpointMetrics.length
    const failedRequests = endpointMetrics.filter(m => !m.success).length

    const averageResponseTime = totalRequests > 0
      ? endpointMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
      : 0

    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
    const lastRequest = endpointMetrics[endpointMetrics.length - 1]

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      lastRequest,
    }
  }

  getRecentErrors(limit: number = 10): RequestMetrics[] {
    return this.metrics
      .filter(m => !m.success)
      .slice(-limit)
      .reverse()
  }

  getSlowestRequests(limit: number = 10): RequestMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  getRequestsByStatus(statusCode: number): RequestMetrics[] {
    return this.metrics.filter(m => m.statusCode === statusCode)
  }

  getRequestsByTimeRange(startTime: number, endTime: number): RequestMetrics[] {
    return this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    )
  }

  clearMetrics(): void {
    this.metrics = []
    this.errorCount = 0
    this.lastError = null
    this.startTime = Date.now()
  }

  private sendMetrics(): void {
    if (process.env.NODE_ENV === 'production') {
      const performance = this.getPerformanceMetrics()
      const health = this.getHealthStatus()
      
      fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performance,
          health,
          timestamp: Date.now(),
        }),
      }).catch(error => {
        console.error('[API Monitoring] Failed to send metrics:', error)
      })
    }
  }

  startPeriodicReporting(interval: number = 60000): void {
    setInterval(() => {
      this.sendMetrics()
    }, interval)
  }

  getRequestTimeline(hours: number = 24): {
    timestamp: number
    requests: number
    errors: number
    averageDuration: number
  }[] {
    const now = Date.now()
    const startTime = now - (hours * 60 * 60 * 1000)
    const interval = 60 * 60 * 1000 // 1 hour intervals

    const timeline = []
    
    for (let time = startTime; time < now; time += interval) {
      const endTime = time + interval
      const requests = this.getRequestsByTimeRange(time, endTime)
      
      timeline.push({
        timestamp: time,
        requests: requests.length,
        errors: requests.filter(r => !r.success).length,
        averageDuration: requests.length > 0 
          ? requests.reduce((sum, r) => sum + r.duration, 0) / requests.length
          : 0,
      })
    }

    return timeline
  }
}

const apiMonitoring = new ApiMonitoring()

if (typeof window !== 'undefined') {
  apiMonitoring.startPeriodicReporting()
}

export default apiMonitoring
export { ApiMonitoring, type RequestMetrics, type PerformanceMetrics, type ApiHealth }
