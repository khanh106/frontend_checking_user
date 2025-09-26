interface WebSocketMessage {
  type: string
  payload: unknown
  timestamp: number
}

interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

type MessageCallback = (payload: unknown, timestamp: number) => void

class WebSocketManager {
  private ws: WebSocket | null = null
  private subscriptions: Map<string, Set<MessageCallback>> = new Map()
  private config: WebSocketConfig
  private reconnectAttempts: number = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnecting: boolean = false
  private messageQueue: WebSocketMessage[] = []

  constructor(config: WebSocketConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.setupHeartbeat()
          this.processMessageQueue()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Disconnected', event.code, event.reason)
          this.isConnecting = false
          this.cleanup()
          
          if (!event.wasClean) {
            this.handleReconnection()
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
          this.isConnecting = false
          reject(error)
        }

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.cleanup()
  }

  subscribe(event: string, callback: MessageCallback): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set())
    }
    
    this.subscriptions.get(event)!.add(callback)
    
    return () => {
      this.unsubscribe(event, callback)
    }
  }

  unsubscribe(event: string, callback: MessageCallback): void {
    const callbacks = this.subscriptions.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.subscriptions.delete(event)
      }
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      this.messageQueue.push(message)
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      const callbacks = this.subscriptions.get(message.type)
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(message.payload, message.timestamp)
          } catch (error) {
            console.error('[WebSocket] Callback error:', error)
          }
        })
      }
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error)
    }
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnection failed:', error)
      })
    }, delay)
  }

  private setupHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          payload: {},
          timestamp: Date.now()
        })
      }
    }, this.config.heartbeatInterval)
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED
  }

  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false
  }
}

const wsManager = new WebSocketManager({
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws',
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
})

export default wsManager
export { WebSocketManager, type WebSocketMessage, type WebSocketConfig }