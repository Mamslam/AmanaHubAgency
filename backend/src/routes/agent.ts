import { prisma } from '../lib/prisma'
import { Router, Response } from 'express'
import { AuthRequest, authMiddleware } from '../middleware/auth'
import { agentEngine } from '../agent/AgentEngine'


const router = Router()


router.use(authMiddleware)

router.get('/status', (req: AuthRequest, res: Response) => {
  res.json({ status: agentEngine.getStatus() })
})

router.post('/start', async (req: AuthRequest, res: Response) => {
  const config = req.body
  agentEngine.start(config).catch(console.error)
  res.json({ success: true, status: 'RUNNING' })
})

router.post('/pause', (req: AuthRequest, res: Response) => {
  agentEngine.pause()
  res.json({ success: true, status: 'PAUSED' })
})

router.post('/stop', (req: AuthRequest, res: Response) => {
  agentEngine.stop()
  res.json({ success: true, status: 'IDLE' })
})

router.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.agentLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(logs.reverse())
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
