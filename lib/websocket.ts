'use client'

type LogHandler = (msg: { message: string; level: string; ts: string }) => void
type StatusHandler = (status: string) => void

class AgentWebSocket {
  private ws: WebSocket | null = null
  private logHandlers: Set<LogHandler> = new Set()
  private statusHandlers: Set<StatusHandler> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private url: string

  constructor(url: string) {
    this.url = url
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('[WS] Connected to agent')
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'log') {
            this.logHandlers.forEach(h => h(data))
          } else if (data.type === 'status') {
            this.statusHandlers.forEach(h => h(data.status))
          }
        } catch {
          // ignore
        }
      }

      this.ws.onclose = () => {
        console.log('[WS] Disconnected, reconnecting in 5s...')
        this.reconnectTimer = setTimeout(() => this.connect(), 5000)
      }

      this.ws.onerror = () => {
        this.ws?.close()
      }
    } catch {
      this.reconnectTimer = setTimeout(() => this.connect(), 5000)
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }

  send(action: string, config?: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, config }))
    }
  }

  onLog(handler: LogHandler) {
    this.logHandlers.add(handler)
    return () => this.logHandlers.delete(handler)
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'

let agentWS: AgentWebSocket | null = null

export function getAgentWS(): AgentWebSocket {
  if (!agentWS) {
    agentWS = new AgentWebSocket(WS_URL)
  }
  return agentWS
}
