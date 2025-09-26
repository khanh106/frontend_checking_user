interface QueuedRequest {
  id: string
  endpoint: string
  options: RequestOptions
  priority: number
  timestamp: number
  retries: number
  maxRetries: number
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
  cache?: boolean
}

interface QueueConfig {
  maxConcurrent: number
  retryDelay: number
  maxRetries: number
  priorityThreshold: number
}

class RequestQueue {
  private queue: QueuedRequest[] = []
  private isProcessing: boolean = false
  private activeRequests: Set<string> = new Set()
  private config: QueueConfig
  private processingTimer: NodeJS.Timeout | null = null

  constructor(config: QueueConfig) {
    this.config = config
  }

  enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): string {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateId(),
      timestamp: Date.now(),
      retries: 0,
      maxRetries: request.maxRetries || this.config.maxRetries,
    }

    this.queue.push(queuedRequest)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.timestamp - b.timestamp
    })

    this.process()
    return queuedRequest.id
  }

  dequeue(): QueuedRequest | null {
    if (this.activeRequests.size >= this.config.maxConcurrent) {
      return null
    }

    const request = this.queue.shift()
    if (request) {
      this.activeRequests.add(request.id)
    }

    return request || null
  }

  async process(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    while (this.queue.length > 0 && this.activeRequests.size < this.config.maxConcurrent) {
      const request = this.dequeue()
      if (!request) break

      this.processRequest(request).catch(() => {
        this.handleRequestFailure(request)
      })
    }

    this.isProcessing = false
  }

  private async processRequest(request: QueuedRequest): Promise<void> {
    try {
      await this.executeRequest(request)
      console.log(`[RequestQueue] Request ${request.id} completed successfully`)
    } catch {
      if (request.retries < request.maxRetries) {
        request.retries++
        this.queue.unshift(request)
        console.log(`[RequestQueue] Retrying request ${request.id} (${request.retries}/${request.maxRetries})`)
      } else {
        console.error(`[RequestQueue] Request ${request.id} failed after ${request.maxRetries} retries`)
        this.handleRequestFailure(request)
      }
    } finally {
      this.activeRequests.delete(request.id)
      this.process()
    }
  }

  private async executeRequest(request: QueuedRequest): Promise<unknown> {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${request.endpoint}`
    
    const response = await fetch(url, {
      method: request.options.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.options.headers,
      },
      body: request.options.body ? JSON.stringify(request.options.body) : undefined,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }

    return response.text()
  }

  private handleRequestFailure(request: QueuedRequest): void {
    this.activeRequests.delete(request.id)
    
    if (request.retries < request.maxRetries) {
      setTimeout(() => {
        this.queue.unshift(request)
        this.process()
      }, this.config.retryDelay * Math.pow(2, request.retries))
    }
  }

  clear(): void {
    this.queue = []
    this.activeRequests.clear()
    
    if (this.processingTimer) {
      clearTimeout(this.processingTimer)
      this.processingTimer = null
    }
  }

  getQueueStatus(): {
    queued: number
    active: number
    total: number
  } {
    return {
      queued: this.queue.length,
      active: this.activeRequests.size,
      total: this.queue.length + this.activeRequests.size,
    }
  }

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  removeRequest(id: string): boolean {
    const index = this.queue.findIndex(req => req.id === id)
    if (index !== -1) {
      this.queue.splice(index, 1)
      return true
    }
    return false
  }

  getRequestById(id: string): QueuedRequest | null {
    return this.queue.find(req => req.id === id) || null
  }

  updateRequestPriority(id: string, priority: number): boolean {
    const request = this.queue.find(req => req.id === id)
    if (request) {
      request.priority = priority
      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        return a.timestamp - b.timestamp
      })
      return true
    }
    return false
  }
}

const requestQueue = new RequestQueue({
  maxConcurrent: 3,
  retryDelay: 1000,
  maxRetries: 3,
  priorityThreshold: 5,
})

export default requestQueue
export { RequestQueue, type QueuedRequest, type QueueConfig }