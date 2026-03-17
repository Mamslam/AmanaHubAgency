import { prisma } from '../lib/prisma'
import cron from 'node-cron'

import { checkReplies } from '../services/gmail'
import { TG } from '../services/telegram'



export function startReplyChecker() {
  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const sentEmails = await prisma.email.findMany({
        where: { status: 'SENT', gmailId: { not: null }, repliedAt: null },
        include: { lead: true },
        take: 50,
      })

      if (!sentEmails.length) return

      const gmailIds = sentEmails.map(e => e.gmailId!).filter(Boolean)
      const repliedIds = await checkReplies(gmailIds)

      for (const email of sentEmails) {
        if (email.gmailId && repliedIds.includes(email.gmailId)) {
          await prisma.email.update({ where: { id: email.id }, data: { status: 'REPLIED', repliedAt: new Date() } })
          await prisma.lead.update({ where: { id: email.leadId }, data: { status: 'REPLIED' } })
          TG.reply(email.lead.domain, email.lead.contactName || email.lead.domain)
          console.log(`[Reply] Reply detected from ${email.lead.domain}`)
        }
      }
    } catch (err) {
      console.error('[ReplyChecker] Error:', err)
    }
  })
  console.log('[Cron] Reply checker scheduled every 30 min')
}
