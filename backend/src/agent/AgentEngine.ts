import { prisma } from '../lib/prisma'

import { fetchPageSpeed } from '../services/pagespeed'
import { analyzeWithClaude } from '../services/claude'
import { sendEmail } from '../services/gmail'
import { TG } from '../services/telegram'
import type { WebSocket as WS } from 'ws'



export type AgentStatus = 'RUNNING' | 'PAUSED' | 'IDLE'

export class AgentEngine {
  private status: AgentStatus = 'IDLE'
  private sockets: Set<WS> = new Set()
  private dailySent = 0
  private dailyLimit = 20
  private delayMinutes = 3
  private autoSend = true

  addSocket(ws: WS) { this.sockets.add(ws) }
  removeSocket(ws: WS) { this.sockets.delete(ws) }
  getStatus(): AgentStatus { return this.status }

  private broadcast(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const payload = JSON.stringify({ type: 'log', message, level, ts: new Date().toISOString() })
    this.sockets.forEach(ws => {
      if (ws.readyState === 1) ws.send(payload)
    })
    // Also save to DB
    prisma.agentLog.create({ data: { message, level } }).catch(() => {})
  }

  private broadcastStatus() {
    const payload = JSON.stringify({ type: 'status', status: this.status, dailySent: this.dailySent })
    this.sockets.forEach(ws => {
      if (ws.readyState === 1) ws.send(payload)
    })
  }

  async start(config?: { dailyLimit?: number; delayMinutes?: number; autoSend?: boolean }) {
    if (this.status === 'RUNNING') return
    if (config) {
      this.dailyLimit = Math.min(config.dailyLimit || 20, 20) // hardcoded max
      this.delayMinutes = Math.max(config.delayMinutes || 3, 3) // hardcoded min 3min
      this.autoSend = config.autoSend ?? true
    }
    this.dailySent = 0
    this.status = 'RUNNING'
    this.broadcastStatus()
    this.broadcast('▶️  Agent session started', 'info')

    await this.runSession()
  }

  pause() {
    this.status = 'PAUSED'
    this.broadcastStatus()
    this.broadcast('⏸ Agent paused', 'warning')
  }

  stop() {
    this.status = 'IDLE'
    this.broadcastStatus()
    this.broadcast('⏹ Agent stopped', 'info')
  }

  private async runSession() {
    try {
      const leads = await prisma.lead.findMany({
        where: {
          status: { in: ['PROSPECT', 'AUDITED'] },
          contactEmail: { not: null },
        },
        take: this.dailyLimit,
        orderBy: { leadScore: 'desc' },
      })

      this.broadcast(`📋 Loading lead queue: ${leads.length} leads pending`, 'info')

      let processed = 0, sent = 0, skipped = 0

      for (const lead of leads) {
        if (this.status !== 'RUNNING') break
        if (this.dailySent >= this.dailyLimit) {
          this.broadcast(`⏸ Daily limit reached (${this.dailyLimit}/${this.dailyLimit})`, 'warning')
          break
        }

        // STEP 1: Validate
        if (!lead.contactEmail) {
          this.broadcast(`⏭ Skipping ${lead.domain} — no email`, 'warning')
          skipped++
          continue
        }

        // Check not emailed in 30 days
        const recentEmail = await prisma.email.findFirst({
          where: { leadId: lead.id, sentAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        })
        if (recentEmail) {
          this.broadcast(`⏭ Skipping ${lead.domain} — emailed recently`, 'info')
          skipped++
          continue
        }

        processed++
        this.broadcast(`▶️  Processing lead: ${lead.domain}`, 'info')

        try {
          // STEP 2: Audit
          let auditData = await prisma.audit.findFirst({ where: { leadId: lead.id }, orderBy: { createdAt: 'desc' } })

          if (!auditData) {
            this.broadcast(`✅ Fetching PageSpeed for ${lead.domain}`, 'success')
            const pageSpeed = await fetchPageSpeed(`https://${lead.domain}`)
            this.broadcast(`✅ Score: Performance ${pageSpeed.performance} | SEO ${pageSpeed.seo} | Accessibility ${pageSpeed.accessibility}`, 'success')

            this.broadcast(`⏳ Running Claude analysis...`, 'info')
            const analysis = await analyzeWithClaude({
              domain: lead.domain,
              businessName: lead.businessName || undefined,
              contactName: lead.contactName || undefined,
              scores: pageSpeed,
              failingAudits: pageSpeed.failingAudits,
              loadTime: pageSpeed.loadTime,
              niche: lead.niche || 'business',
              language: lead.language,
              aigencyIssues: lead.aigencyIssues,
            })
            this.broadcast(`✅ Claude analysis complete`, 'success')

            auditData = await prisma.audit.create({
              data: {
                leadId: lead.id,
                scores: pageSpeed as any,
                issues: (analysis.issues as any) || [],
                roiAnalysis: (analysis.roiAnalysis as any) || {},
                dynamicPricing: (analysis.dynamicPricing as any) || {},
                outreachEmails: (analysis.outreach as any) || {},
              },
            })

            await prisma.lead.update({ where: { id: lead.id }, data: { status: 'AUDITED' } })
            this.broadcast(`✅ Audit saved to database`, 'success')
          }

          // STEP 3: Compose
          const outreachEmails = auditData.outreachEmails as any
          const emailContent = outreachEmails[lead.language] || outreachEmails.EN || outreachEmails.DE
          if (!emailContent) {
            this.broadcast(`⚠️  No email template for language ${lead.language}, skipping`, 'warning')
            skipped++
            continue
          }

          const subject = emailContent.subject || `Website analysis for ${lead.domain}`
          const body = (emailContent.body || '').replace('{{contactName}}', lead.contactName || 'Sir/Madam').replace('{{domain}}', lead.domain)
          this.broadcast(`✅ Email drafted (${lead.language})`, 'success')

          // STEP 4: Send or Draft
          if (this.autoSend) {
            const gmailId = await sendEmail({ to: lead.contactEmail!, subject, body })
            this.broadcast(`✅ Email sent to ${lead.contactEmail}`, 'success')

            await prisma.email.create({
              data: { leadId: lead.id, subject, body, language: lead.language, type: 'OUTREACH', status: 'SENT', sentAt: new Date(), gmailId },
            })
            await prisma.lead.update({ where: { id: lead.id }, data: { status: 'EMAILED' } })

            this.dailySent++
            sent++
          } else {
            // Draft mode
            await prisma.email.create({
              data: { leadId: lead.id, subject, body, language: lead.language, type: 'OUTREACH', status: 'DRAFT' },
            })
            this.broadcast(`📝 Draft saved for ${lead.domain} — awaiting approval`, 'info')
          }

        } catch (err: any) {
          this.broadcast(`❌ Error processing ${lead.domain}: ${err.message}`, 'error')
          skipped++
          await prisma.agentLog.create({ data: { message: `Failed: ${lead.domain} — ${err.message}`, level: 'error', leadId: lead.id } }).catch(() => {})
        }

        // Batch notification every 5 leads
        if (processed % 5 === 0) {
          TG.agentComplete(sent, skipped, 0, sent * 1500)
        }

        // STEP 5: Wait (if more leads)
        if (leads.indexOf(lead) < leads.length - 1 && this.status === 'RUNNING') {
          this.broadcast(`⏳ Waiting ${this.delayMinutes} min before next lead...`, 'info')
          await new Promise(r => setTimeout(r, this.delayMinutes * 60 * 1000))
        }
      }

      // Session complete
      this.broadcast(`📊 Session complete: ${sent} sent, ${skipped} skipped`, 'info')
      TG.agentComplete(sent, skipped, 0, sent * 1500)
      this.status = 'IDLE'
      this.broadcastStatus()

    } catch (err: any) {
      this.broadcast(`❌ Agent crashed: ${err.message}`, 'error')
      this.status = 'IDLE'
      this.broadcastStatus()
    }
  }
}

export const agentEngine = new AgentEngine()
