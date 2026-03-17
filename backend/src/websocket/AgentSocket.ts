import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { agentEngine } from '../agent/AgentEngine'

// Track all connected clients for broadcasting
const connectedClients = new Set<WebSocket>()

export function broadcastToAll(data: any): void {
  const payload = JSON.stringify(data)
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  }
}

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('[WS] Client connected')
    connectedClients.add(ws)
    agentEngine.addSocket(ws)

    // Send current status immediately
    ws.send(JSON.stringify({ type: 'status', status: agentEngine.getStatus() }))

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())
        if (msg.action === 'start') agentEngine.start(msg.config)
        if (msg.action === 'pause') agentEngine.pause()
        if (msg.action === 'stop') agentEngine.stop()
      } catch {
        // ignore malformed messages
      }
    })

    ws.on('close', () => {
      connectedClients.delete(ws)
      agentEngine.removeSocket(ws)
      console.log('[WS] Client disconnected')
    })
  })
}
