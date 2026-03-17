import axios from 'axios'

export async function sendWhatsApp(params: {
  to: string
  message: string
  pdfUrl?: string
  language: string
}): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.WHATSAPP_360DIALOG_API_KEY
  const partnerId = process.env.WHATSAPP_360DIALOG_PARTNER_ID

  if (!apiKey) {
    console.warn('[WhatsApp] WHATSAPP_360DIALOG_API_KEY not set')
    return { success: false }
  }

  try {
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to.replace('+', ''),
      type: 'text',
      text: { body: params.message },
    }

    const res = await axios.post(
      `https://waba.360dialog.io/v1/messages`,
      payload,
      {
        headers: {
          'D360-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    const messageId = res.data?.messages?.[0]?.id
    return { success: true, messageId }
  } catch (err: any) {
    console.error('[WhatsApp] Send failed:', err.message)
    return { success: false }
  }
}

export function buildWhatsAppMessage(params: {
  name: string | null
  domain: string
  issueCount: number
  monthlyLoss: number
  language: string
}): string {
  const { name, domain, issueCount, monthlyLoss, language } = params
  const nameStr = name ? name : ''
  const loss = monthlyLoss > 0 ? `~€${monthlyLoss}` : '~€500+'

  const templates: Record<string, string> = {
    FR: `Bonjour ${nameStr ? nameStr + ',' : ','} j'ai analysé ${domain} et trouvé ${issueCount} problèmes qui vous coûtent ${loss}/mois. J'ai préparé un rapport gratuit — puis-je vous l'envoyer ?`,
    DE: `Hallo ${nameStr ? nameStr + ',' : ','} ich habe ${domain} analysiert und ${issueCount} kritische Probleme gefunden (${loss}/Monat). Darf ich Ihnen den kostenlosen Bericht zusenden?`,
    AR: `مرحبا ${nameStr ? nameStr + '،' : '،'} قمت بتحليل موقع ${domain} ووجدت ${issueCount} مشاكل تكلفك ${loss}/شهر. هل يمكنني إرسال التقرير المجاني لك؟`,
    EN: `Hi ${nameStr ? nameStr + ',' : ','} I analyzed ${domain} and found ${issueCount} issues costing you ${loss}/month. Can I send you the free report?`,
  }

  return templates[language] || templates.EN
}
