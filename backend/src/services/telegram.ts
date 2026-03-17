import axios from 'axios'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegram(message: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('[Telegram] Not configured, skipping:', message)
    return
  }
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    })
  } catch (err: any) {
    console.error('[Telegram] Failed:', err.message)
  }
}

export const TG = {
  reply: (domain: string, contact: string) =>
    sendTelegram(`🔔 <b>Reply received!</b>\n${contact} (${domain}) replied to your email!`),
  dealClosed: (client: string, value: number) =>
    sendTelegram(`💼 <b>New deal closed!</b>\n${client} — €${value.toLocaleString()}`),
  invoicePaid: (number: string, amount: number) =>
    sendTelegram(`💳 <b>Invoice ${number} paid ✅</b>\n€${amount.toLocaleString()} received via Stripe`),
  agentComplete: (sent: number, skipped: number, replies: number, pipelineValue: number) =>
    sendTelegram(`📊 <b>Agent session complete</b>\nSent: ${sent} | Skipped: ${skipped} | Replies: ${replies}\nPipeline value: €${pipelineValue.toLocaleString()}`),
  monthlyReport: (month: string, revenue: number, mrr: number, clients: number, emailsSent: number, replyRate: number) =>
    sendTelegram(`📈 <b>Monthly Report — ${month}</b>\nRevenue: €${revenue.toLocaleString()}\nMRR: €${mrr}/mo\nNew clients: ${clients}\nEmails sent: ${emailsSent}\nReply rate: ${replyRate}%`),
}
