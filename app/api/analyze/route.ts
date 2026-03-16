import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { domain, scores, failingAudits } = await req.json()

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const userPrompt = `Prepare a client audit report for ${domain}.

PageSpeed Scores (mobile):
- Performance: ${scores.performance}/100
- Accessibility: ${scores.accessibility}/100
- Best Practices: ${scores.bestPractices}/100
- SEO: ${scores.seo}/100

Top failing audits:
${failingAudits.map((a: string) => `- ${a}`).join('\n')}

Respond ONLY with this JSON structure:
{
  "summary": "2-3 sentence executive summary of site health",
  "grade": "A|B|C|D|F",
  "issues": [
    {
      "title": "...",
      "detail": "one sentence max",
      "severity": "critical|warning|info",
      "category": "Performance|Accessibility|SEO|Best Practices"
    }
  ],
  "services": [
    {
      "name": "...",
      "price": "$X–$Y",
      "reason": "one sentence why they need it"
    }
  ],
  "bundle": {
    "name": "Full Fix Package",
    "price": "$997–$2,500",
    "savings": "Save $X vs individual services",
    "includes": ["service1", "service2", "service3"]
  },
  "outreachFR": {
    "subject": "...",
    "body": "Professional email in French, 150 words max, formal tone"
  },
  "outreachEN": {
    "subject": "...",
    "body": "Same email in English, 150 words max"
  },
  "outreachDE": {
    "subject": "...",
    "body": "Same email in German, 150 words max"
  }
}

Pricing reference:
- Performance Optimization: $297–$997
- Accessibility Improvements: $197–$497
- Best Practices: $197–$597
- SEO Enhancements: $297–$797
- AI Chatbot Integration: $497–$1,500
- Website Redesign: $997–$3,000
- GMB Optimization: $297–$697
- Full Audit Bundle: $997–$2,500

Include 4-6 issues, 3-4 services.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You are a senior web consultant at AmanaHub. Always respond with valid JSON only. No markdown, no code fences.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const analysis = JSON.parse(content.text)
    return NextResponse.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
