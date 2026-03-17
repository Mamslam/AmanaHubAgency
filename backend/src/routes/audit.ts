import { prisma } from '../lib/prisma'
import { Router, Response } from 'express'

import { AuthRequest, authMiddleware } from '../middleware/auth'
import { fetchPageSpeed } from '../services/pagespeed'
import { analyzeWithClaude } from '../services/claude'

const router = Router()

router.use(authMiddleware)

router.post('/run', async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, domain, niche, language } = req.body

    const pageSpeed = await fetchPageSpeed(`https://${domain}`)
    const lead = leadId ? await prisma.lead.findUnique({ where: { id: leadId } }) : null

    const analysis = await analyzeWithClaude({
      domain,
      businessName: lead?.businessName || undefined,
      contactName: lead?.contactName || undefined,
      scores: pageSpeed,
      failingAudits: pageSpeed.failingAudits,
      loadTime: pageSpeed.loadTime,
      niche: niche || lead?.niche || 'business',
      language: language || lead?.language || 'EN',
      aigencyIssues: lead?.aigencyIssues || [],
    })

    const audit = await prisma.audit.create({
      data: {
        leadId: leadId || '',
        scores: pageSpeed as any,
        issues: (analysis.issues as any) || [],
        roiAnalysis: (analysis.roiAnalysis as any) || {},
        dynamicPricing: (analysis.dynamicPricing as any) || {},
        outreachEmails: (analysis.outreach as any) || {},
      },
    })

    if (leadId) {
      await prisma.lead.update({ where: { id: leadId }, data: { status: 'AUDITED' } })
    }

    res.json({ audit, pageSpeed, analysis })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:leadId', async (req: AuthRequest, res: Response) => {
  try {
    const audits = await prisma.audit.findMany({
      where: { leadId: req.params.leadId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(audits)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
