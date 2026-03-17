import { prisma } from '../lib/prisma'
import { Router, Response } from 'express'

import { AuthRequest, authMiddleware } from '../middleware/auth'

const router = Router()


router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, niche, language, page = '1', limit = '50' } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (niche && niche !== 'all') where.niche = niche
    if (language && language !== 'all') where.language = language

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { audits: { take: 1, orderBy: { createdAt: 'desc' } } },
      }),
      prisma.lead.count({ where }),
    ])

    res.json({ leads, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id as string },
      include: { audits: true, emails: true, deals: { include: { invoices: true, deliverables: true } } },
    })
    if (!lead) { res.status(404).json({ error: 'Lead not found' }); return }
    res.json(lead)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const lead = await prisma.lead.create({ data: req.body })
    res.status(201).json(lead)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const lead = await prisma.lead.update({ where: { id: req.params.id as string }, data: req.body })
    res.json(lead)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id as string } })
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// Bulk CSV import
router.post('/import', async (req: AuthRequest, res: Response) => {
  try {
    const { leads } = req.body as { leads: Record<string, unknown>[] }
    let imported = 0, duplicates = 0

    for (const lead of leads) {
      try {
        await prisma.lead.create({ data: lead as any })
        imported++
      } catch {
        duplicates++
      }
    }

    res.json({ imported, duplicates })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
