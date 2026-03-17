import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { agentEngine } from '../agent/AgentEngine'

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('[WS] Client connected')
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
      agentEngine.removeSocket(ws)
      console.log('[WS] Client disconnected')
    })
  })
}
