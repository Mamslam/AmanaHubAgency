import { Router, Response } from 'express'
import { AuthRequest, authMiddleware } from '../middleware/auth'
import { runScraper } from '../services/scraper/orchestrator'
import { prisma } from '../lib/prisma'
import { broadcastToAll } from '../websocket/AgentSocket'
import type { ScraperInput } from '../services/scraper/types'
import { randomUUID } from 'crypto'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const router = Router()
router.use(authMiddleware)

// In-memory job store (simple, no Redis needed)
const jobs = new Map<string, { status: string; leads?: any[]; error?: string; startedAt: Date; summary?: any }>()

router.post('/run', async (req: AuthRequest, res: Response) => {
  try {
    const input: ScraperInput = {
      niche: req.body.niche || 'restaurant',
      city: req.body.city || '',
      country: req.body.country || 'DE',
      language: req.body.language || 'DE',
      limit: Math.min(100, Math.max(5, parseInt(req.body.limit) || 50)),
    }

    if (!input.city) {
      res.status(400).json({ error: 'city is required' })
      return
    }

    const jobId = randomUUID()
    jobs.set(jobId, { status: 'running', startedAt: new Date() })

    // Run async, stream progress via WebSocket
    runScraper(input, (event) => {
      broadcastToAll({ type: 'scraper_progress', jobId, ...event })
    }).then(leads => {
      const summary = {
        total: leads.length,
        highPriority: leads.filter(l => l.score.priority === 'high').length,
        withEmail: leads.filter(l => l.contact.email).length,
        withWhatsApp: leads.filter(l => l.contact.whatsappActive).length,
        noSSL: leads.filter(l => l.audit && !l.audit.hasSSL).length,
        avgAiScore: leads.length > 0
          ? Math.round(leads.reduce((s, l) => s + (l.audit?.aiVisibilityScore ?? 0), 0) / leads.length)
          : 0,
        estimatedPipelineValue: leads.reduce((s, l) => s + l.score.estimatedDeal, 0),
      }
      jobs.set(jobId, { status: 'done', leads, summary, startedAt: jobs.get(jobId)!.startedAt })
      broadcastToAll({ type: 'scraper_progress', jobId, phase: 4, label: 'Done', current: leads.length, total: leads.length, done: true, leads, summary })
    }).catch(err => {
      jobs.set(jobId, { status: 'error', error: err.message, startedAt: jobs.get(jobId)!.startedAt })
      broadcastToAll({ type: 'scraper_progress', jobId, phase: 4, label: `Error: ${err.message}`, current: 0, total: 0, done: true, error: err.message })
    })

    res.json({ jobId })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/jobs', (req: AuthRequest, res: Response) => {
  const list = Array.from(jobs.entries())
    .slice(-10)
    .map(([id, job]) => ({
      jobId: id,
      status: job.status,
      startedAt: job.startedAt,
      summary: job.summary,
      leadCount: job.leads?.length ?? 0,
    }))
    .reverse()
  res.json(list)
})

router.get('/jobs/:jobId', (req: AuthRequest, res: Response) => {
  const job = jobs.get(req.params.jobId as string)
  if (!job) { res.status(404).json({ error: 'Job not found' }); return }
  res.json(job)
})

router.post('/import', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, leadIds } = req.body as { jobId: string; leadIds: string[] }
    const job = jobs.get(jobId)
    if (!job?.leads) { res.status(404).json({ error: 'Job not found or not complete' }); return }

    const toImport = job.leads.filter((l: any) => !leadIds || leadIds.includes(l.domain))
    let imported = 0

    for (const lead of toImport) {
      try {
        await prisma.lead.upsert({
          where: { domain: lead.domain },
          update: { status: 'PROSPECT', leadScore: lead.score.score },
          create: {
            domain: lead.domain,
            businessName: lead.businessName,
            contactEmail: lead.contact.email || undefined,
            contactPhone: lead.contact.phone || undefined,
            contactName: lead.contact.contactName || undefined,
            city: lead.city,
            country: lead.country,
            niche: lead.niche,
            language: lead.language,
            aigencyIssues: lead.issues.slice(0, 5).map((i: any) => i.title),
            leadScore: lead.score.score,
            status: 'PROSPECT',
          },
        })
        imported++
      } catch { /* skip */ }
    }

    res.json({ imported })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/scraper/insights — Claude batch analysis of scraped leads
router.post('/insights', async (req: AuthRequest, res: Response) => {
  try {
    const { leads } = req.body as { leads: any[] }
    if (!leads?.length) { res.status(400).json({ error: 'No leads provided' }); return }

    const summary = leads.slice(0, 20).map((l: any, i: number) =>
      `${i + 1}. ${l.domain} (${l.niche}, ${l.city}) — score ${l.score}/10, ${l.priority} priority, deal €${l.estimatedDeal}, issues: ${l.topIssues?.join(', ')}`
    ).join('\n')

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      temperature: 0,
      system: 'You are a sales coach for a digital agency. Respond with valid JSON only. No markdown.',
      messages: [{
        role: 'user',
        content: `Analyze these scraped leads and give strategic advice:\n\n${summary}\n\nRespond with:\n{\n  "top3": [{"domain":"...","reason":"..."},{"domain":"...","reason":"..."},{"domain":"...","reason":"..."}],\n  "bestNicheCity": "one line",\n  "outreachAngle": "one sentence — what angle to use for this market"\n}`,
      }],
    })

    const text = (msg.content[0] as any).text as string
    res.json(JSON.parse(text.trim()))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
