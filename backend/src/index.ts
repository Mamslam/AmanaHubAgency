import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import { setupWebSocket } from './websocket/AgentSocket'
import { startDailyCron } from './cron/dailyAgent'
import { startReplyChecker } from './cron/replyChecker'
import authRouter from './routes/auth'
import leadsRouter from './routes/leads'
import agentRouter from './routes/agent'
import auditRouter from './routes/audit'
import settingsRouter from './routes/settings'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/leads', leadsRouter)
app.use('/api/agent', agentRouter)
app.use('/api/audit', auditRouter)
app.use('/api/settings', settingsRouter)

// WebSocket
const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })
setupWebSocket(wss)

// Start cron jobs
startDailyCron()
startReplyChecker()

server.listen(PORT, () => {
  console.log(`[AmanaHub Backend] Running on port ${PORT}`)
  console.log(`[AmanaHub Backend] WebSocket: ws://localhost:${PORT}/ws`)
})

export default app
