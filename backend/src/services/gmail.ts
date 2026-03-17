import { google } from 'googleapis'

function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://command.amana-hub.com/api/command/auth/gmail/callback'
  )
  if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
  }
  return oauth2Client
}

export async function sendEmail(params: {
  to: string
  subject: string
  body: string
  pdfBase64?: string
  pdfFileName?: string
}): Promise<string> {
  const auth = getOAuth2Client()
  const gmail = google.gmail({ version: 'v1', auth })

  const boundary = 'amanahub_boundary'
  let rawMessage = [
    `From: AmanaHub <${process.env.GMAIL_FROM || 'hello@amana-hub.com'}>`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    params.body,
  ]

  if (params.pdfBase64 && params.pdfFileName) {
    rawMessage = rawMessage.concat([
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${params.pdfFileName}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${params.pdfFileName}"`,
      '',
      params.pdfBase64,
    ])
  }

  rawMessage.push(`--${boundary}--`)
  const raw = Buffer.from(rawMessage.join('\n')).toString('base64url')

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })

  return result.data.id || ''
}

export async function checkReplies(trackedGmailIds: string[]): Promise<string[]> {
  if (!trackedGmailIds.length) return []
  const auth = getOAuth2Client()
  const gmail = google.gmail({ version: 'v1', auth })

  const repliedIds: string[] = []

  for (const messageId of trackedGmailIds) {
    try {
      const thread = await gmail.users.threads.get({
        userId: 'me',
        id: messageId,
      })
      if ((thread.data.messages?.length || 0) > 1) {
        repliedIds.push(messageId)
      }
    } catch {
      // skip
    }
  }

  return repliedIds
}
