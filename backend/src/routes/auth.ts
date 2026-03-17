import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'amanahub-secret-2026'
const PORTAL_CODE = process.env.PORTAL_CODE || 'AMANAHUB2026'

router.post('/login', (req: Request, res: Response) => {
  const { code } = req.body
  if (!code || code !== PORTAL_CODE) {
    res.status(401).json({ valid: false })
    return
  }
  const token = jwt.sign({ userId: 'operator', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
  res.json({ valid: true, token })
})

export default router
