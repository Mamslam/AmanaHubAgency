import cron from 'node-cron'
import { agentEngine } from '../agent/AgentEngine'
import { TG } from '../services/telegram'

// Run every day at 08:00
export function startDailyCron() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Daily agent session starting...')
    try {
      await agentEngine.start({ dailyLimit: 20, delayMinutes: 3, autoSend: true })
    } catch (err) {
      console.error('[Cron] Daily agent failed:', err)
      TG.agentComplete(0, 0, 0, 0)
    }
  })
  console.log('[Cron] Daily agent scheduled at 08:00')
}
