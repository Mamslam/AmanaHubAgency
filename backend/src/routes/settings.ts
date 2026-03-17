import { prisma } from '../lib/prisma'
import { Router, Response } from 'express'
import { AuthRequest, authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// GET /api/settings — return all settings as key-value map
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.settings.findMany()
    const map: Record<string, string> = {}
    rows.forEach(r => { map[r.key] = r.value })
    res.json(map)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/settings — upsert multiple settings at once
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body as Record<string, string>
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
